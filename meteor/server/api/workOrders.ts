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
import { getCurrentTime, literal, sleep } from '../../lib/lib'
import { logger } from '../logging'

function createCommandLine(workOrder: PublicWorkOrder): string[] {
	return ['dummyScript', workOrder.blueprintSourceRef, workOrder.coreSourceRef, workOrder.testSuiteSourceRef]
}

async function workOnWorkOrder(_workOrder: WorkOrder): Promise<WorkOrderStatus.Passed | WorkOrderStatus.Failed> {
	await sleep(10000)

	return WorkOrderStatus.Passed
}

function setWorkOrderStatus(workOrderId: WorkOrderId, status: WorkOrderStatus): void {
	WorkOrders.update(workOrderId, {
		$set: {
			status,
		},
	})
}

function _onOutputFromCommand(workOrderId: WorkOrderId, data: string): void {
	WorkOrderOutputs.insert({
		_id: protectString(Random.id()),
		data,
		timestamp: getCurrentTime(),
		workOrderId,
	})
}

class WorkOrdersAPIClass extends MethodContextAPI implements WorkOrdersAPI {
	addWorkOrder(workOrderSpec: PublicWorkOrder): WorkOrderId {
		check(workOrderSpec, Object)
		checkUserAccess(this)

		const newId = protectString<WorkOrderId>(Random.id())

		const commandline = createCommandLine(workOrderSpec)

		return WorkOrders.insert({
			...workOrderSpec,
			commandline,
			status: WorkOrderStatus.Waiting,
			created: getCurrentTime(),
			_id: newId,
		})
	}
	changeWorkOrder(workOrderId: WorkOrderId, workOrderSpec: Partial<PublicWorkOrder>): void {
		check(workOrderId, String)
		check(workOrderSpec, Object)
		checkUserAccess(this)

		WorkOrders.update(workOrderId, {
			$set: workOrderSpec,
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
	}
}

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

		setWorkOrderStatus(workOrderId, WorkOrderStatus.Working)

		try {
			const passedOrFailed = await workOnWorkOrder(workOrder)

			setWorkOrderStatus(workOrderId, passedOrFailed)
		} catch (e) {
			setWorkOrderStatus(workOrderId, WorkOrderStatus.Failed)
		}

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
