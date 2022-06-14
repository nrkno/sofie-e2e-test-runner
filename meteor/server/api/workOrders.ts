import cp from 'child_process'
import { check } from 'meteor/check'
import { Random } from 'meteor/random'
import { MethodContextAPI } from '../../lib/api/methods'
import { registerClassToMeteorMethods } from '../methods'
import { protectString } from '../../lib/protectedString'
import { checkUserAccess } from '../security/methods'
import { PublicWorkOrder, WorkOrdersAPI, WorkOrdersAPIMethods } from '../../lib/api/workOrders'
import { WorkOrder, WorkOrderId, WorkOrders, WorkOrderStatus } from '../../lib/collections/WorkOrder'
import { WorkOrderOutputs } from '../../lib/collections/WorkOrderOutput'
import { WorkArtifacts } from '../../lib/collections/WorkArtifact'
import { Jobs } from 'meteor/wildhart:jobs'
import { JobNames } from '../lib/jobs'
import { Meteor } from 'meteor/meteor'
import type { MongoSelector } from '../../lib/mongo'
import { getCurrentTime, literal, Time } from '../../lib/lib'
import { logger } from '../logging'
import { Vessel, VesselId, Vessels } from '../../lib/collections/Vessels'
import { catchArtifactsInOutput } from './workArtifacts'
import { Env } from '../env'
import { checkoutGitRepo, getGitRepositoryPath } from './sources/git'
import { CoreDockerRegistrySource, GitRepositorySource, SourceId, Sources } from '../../lib/collections/Sources'

const WORK_ORDER_TIMEOUT = 2 * 3600 * 1000 // 4hrs
const VESSEL_RETRY = 60 //seconds

function createCommandLine(workOrder: PublicWorkOrder, coreSource: CoreDockerRegistrySource): string[] {
	const registry = coreSource.registry ? coreSource.registry + '/' : ''
	return [
		// 'SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt',
		'node',
		'--use-openssl-ca',
		'dist/main.js',
		'--core',
		registry + coreSource.repo + ':' + workOrder.coreSourceRef,
		'--playout',
		registry + coreSource.playoutImage + ':' + workOrder.coreSourceRef,
		'--ingest',
		registry + coreSource.ingestImage + ':' + workOrder.coreSourceRef,
		'--testRepoFolder',
		getGitRepositoryPath(workOrder.testSuiteSource as any), // wtf typescript?
	]
}

async function checkoutTestsRepository(sourceId: SourceId, ref: string) {
	const source = Sources.findOne(sourceId) as GitRepositorySource | undefined
	if (!source) {
		throw new Error(`Source not found: "${sourceId}"`)
	}

	return checkoutGitRepo(source._id, source.url, ref, source.privateKey)
}

async function workOnWorkOrder(workOrder: WorkOrder): Promise<WorkOrderStatus.Passed | WorkOrderStatus.Failed> {
	return new Promise<WorkOrderStatus.Passed | WorkOrderStatus.Failed>(async (resolve, reject) => {
		const command = workOrder.commandline[0]
		const args = workOrder.commandline.slice(1)

		const workOrderId = workOrder._id

		let sentResult = false

		logger.debug(`Checking out tests reposistory..`)
		await checkoutTestsRepository(workOrder.testSuiteSource, workOrder.testSuiteSourceRef)

		logger.debug(`Starting process: ${command} ${args.join(' ')}`)
		const worker = cp.spawn(command, args, {
			stdio: 'pipe',
			timeout: WORK_ORDER_TIMEOUT,
			cwd: Env.EXECUTOR_CWD,
		})
		// We expect the process to output text
		worker.stdout.setEncoding('utf8')
		worker.stderr.setEncoding('utf8')

		worker.stdout.on(
			'data',
			Meteor.bindEnvironment((data) => {
				onOutputFromCommand(workOrderId, data, workOrder.tags)
			})
		)
		worker.stderr.on(
			'data',
			Meteor.bindEnvironment((data) => {
				onOutputFromCommand(workOrderId, data, workOrder.tags, 'stderr')
			})
		)

		worker.on(
			'error',
			Meteor.bindEnvironment((err) => {
				if (sentResult) return
				sentResult = true
				logger.error(`Process for WorkOrder "${workOrderId}" execution failed with error: ${err}`)
				reject(err)
			})
		)
		worker.on(
			'close',
			Meteor.bindEnvironment((code) => {
				if (sentResult) return
				sentResult = true
				if (code !== 0) {
					logger.warn(`Process for WorkOrder "${workOrderId}" execution finished with code: ${code}`)
					resolve(WorkOrderStatus.Failed)
					return
				}
				logger.debug(`Process for WorkOrder "${workOrderId}" finished with code ${code}.`)
				resolve(WorkOrderStatus.Passed)
			})
		)
	})
}

function setWorkOrderStatus(workOrderId: WorkOrderId, status: WorkOrderStatus): void {
	logger.silly(`setWorkOrderStatus "${workOrderId}": ${status}`)
	WorkOrders.update(workOrderId, {
		$set: {
			status,
		},
	})
}

function setWorkOrderTimestamp(workOrderId: WorkOrderId, type: 'started' | 'finished', timestamp: Time): void {
	logger.silly(`setWorkOrderTimestamp "${workOrderId}": ${type} ${timestamp}`)
	WorkOrders.update(workOrderId, {
		$set: {
			[type]: timestamp,
		},
	})
}

function setWorkOrderVessel(workOrderId: WorkOrderId, vesselId: VesselId): void {
	WorkOrders.update(workOrderId, {
		$set: {
			vesselId,
		},
	})
}

function onOutputFromCommand(
	workOrderId: WorkOrderId,
	data: string,
	workOrderTags: string[],
	type?: 'stdout' | 'stderr'
): void {
	logger.silly(`"${workOrderId}": ${data}`)
	catchArtifactsInOutput(workOrderId, data, workOrderTags)
	WorkOrderOutputs.insert({
		_id: protectString(Random.id()),
		data,
		type,
		timestamp: getCurrentTime(),
		workOrderId,
	})
}

class WorkOrdersAPIClass extends MethodContextAPI implements WorkOrdersAPI {
	addWorkOrder(workOrderSpec: PublicWorkOrder): WorkOrderId {
		check(workOrderSpec, Object)
		checkUserAccess(this)

		const newId = protectString<WorkOrderId>(Random.id())

		const coreSource = Sources.findOne(workOrderSpec.coreSource)

		if (!coreSource) {
			throw new Error('Could not find core source ' + workOrderSpec.coreSource)
		}

		const commandline = createCommandLine(workOrderSpec, coreSource as CoreDockerRegistrySource)

		const workOrderId = WorkOrders.insert({
			...workOrderSpec,
			commandline,
			status: WorkOrderStatus.Waiting,
			created: getCurrentTime(),
			_id: newId,
		})

		const jobScheduled = Jobs.run(JobNames.StartOnWorkOrder, workOrderId, WORK_ORDER_JOB_CONFIG)
		if (!jobScheduled) {
			logger.error(`Job not scheduled for "${workOrderId}".`)
		}

		// If there are no other jobs pending in the Queue, start working immediately
		if (jobScheduled && Jobs.countPending(JobNames.StartOnWorkOrder) === 1) {
			Jobs.execute(jobScheduled._id)
		}

		return workOrderId
	}
	changeWorkOrder(workOrderId: WorkOrderId, workOrderSpec: Partial<PublicWorkOrder>): void {
		check(workOrderId, String)
		check(workOrderSpec, Object)
		checkUserAccess(this)

		const oldWorkOrder = WorkOrders.findOne(workOrderId)
		if (!oldWorkOrder) {
			throw new Meteor.Error(404, `Work order "${workOrderId}" not found.`)
		}

		const modifiedWorkOrder = {
			...oldWorkOrder,
			...workOrderSpec,
		}

		const coreSource = Sources.findOne(modifiedWorkOrder.coreSource)

		if (!coreSource) {
			throw new Error('Could not find core source ' + modifiedWorkOrder.coreSource)
		}

		const commandline = createCommandLine(modifiedWorkOrder, coreSource as CoreDockerRegistrySource)

		WorkOrders.update(workOrderId, {
			$set: {
				...workOrderSpec,
				commandline,
			},
		})
	}
	removeWorkOrder(workOrderId: WorkOrderId): void {
		check(workOrderId, String)
		checkUserAccess(this)

		WorkOrders.remove(workOrderId)
		WorkOrderOutputs.remove({
			workOrderId,
		})
		WorkArtifacts.remove({
			workOrderId,
		})

		const jobsCleared = Jobs.clear('pending', JobNames.StartOnWorkOrder, workOrderId)
		logger.debug(`Removed WorkOrder "${workOrderId}", cleared ${jobsCleared} job assigned to it.`)
	}
}

const WORK_ORDER_JOB_CONFIG = literal<Partial<Jobs.JobConfig>>({
	in: {
		seconds: 3,
	},
	// don't queue any new tasks, if there is a task on the same queue and with same arguments
	singular: true,
})

const CLEAN_UP_JOB_CONFIG = literal<Partial<Jobs.JobConfig>>({
	in: {
		hours: 24,
	},
	// don't start any other task in the queue, before the promise of the previous task resolves
	awaitAsync: true,
	// don't queue any new tasks, if there is a task on the same queue and with same arguments
	singular: true,
})

// Remove orphaned WorkOrderOutputs and WorkArtifacts if there are any
Jobs.register({
	[JobNames.StartOnWorkOrder]: async function (workOrderId: WorkOrderId): Promise<void> {
		const workOrder = WorkOrders.findOne(workOrderId)
		if (!workOrder) {
			logger.error(`Could not find scheduled workOrder: "${workOrderId}"`)
			this.failure()
			return
		}

		if (workOrder.status === WorkOrderStatus.Cancelled) {
			logger.warn(`Run for WorkOrder "${workOrderId}" was cancelled.`)
			this.success()
			return
		}

		if (workOrder.status !== WorkOrderStatus.Waiting) {
			throw new Meteor.Error(
				501,
				`Trying to start work on WorkOrder "${workOrderId}", but it's status was: "${workOrder.status}"`
			)
		}

		const busyVessels = WorkOrders.find(
			{
				status: WorkOrderStatus.Working,
			},
			{
				fields: {
					vesselId: 1,
				},
			}
		).map((partialWorkOrder) => partialWorkOrder.vesselId)

		let vesselSelector: MongoSelector<Vessel> = {}
		if (busyVessels.length > 0) {
			vesselSelector = {
				_id: {
					$nin: busyVessels,
				},
			}
		}
		const targetVessel = Vessels.findOne(vesselSelector)

		if (!targetVessel) {
			logger.warn(
				`No target vessel could be found for WorkOrder "${workOrderId}", retry in ${VESSEL_RETRY} seconds`
			)
			this.reschedule({
				in: {
					seconds: VESSEL_RETRY,
				},
			})
			return
		}

		setWorkOrderVessel(workOrderId, targetVessel._id)

		logger.silly(`Starting work on "${workOrderId}" on Vessel "${targetVessel.host}"`)
		setWorkOrderStatus(workOrderId, WorkOrderStatus.Working)
		setWorkOrderTimestamp(workOrderId, 'started', getCurrentTime())

		try {
			const passedOrFailed = await workOnWorkOrder(workOrder)

			setWorkOrderStatus(workOrderId, passedOrFailed)
		} catch (e) {
			setWorkOrderStatus(workOrderId, WorkOrderStatus.FailedToRun)
		}

		logger.silly(`Finished work on "${workOrderId}"`)
		setWorkOrderTimestamp(workOrderId, 'finished', getCurrentTime())
		this.success()
	},
	[JobNames.CleanUpOrphanedOutputsAndArtifacts]: async function (): Promise<void> {
		const allWorkOrderIds = WorkOrders.find(
			{},
			{
				fields: {
					_id: 1,
				},
			}
		).map((workOrder) => workOrder._id)

		WorkOrderOutputs.remove({
			workOrderId: {
				$nin: allWorkOrderIds,
			},
		})
		WorkArtifacts.remove({
			workOrderId: {
				$nin: allWorkOrderIds,
			},
		})

		this.replicate(CLEAN_UP_JOB_CONFIG)
		this.success()
	},
})

Meteor.startup(() => {
	Jobs.run(JobNames.CleanUpOrphanedOutputsAndArtifacts)
})

registerClassToMeteorMethods(WorkOrdersAPIMethods, WorkOrdersAPIClass, false)
