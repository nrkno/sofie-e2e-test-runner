import {
	DockerRegistrySourceId,
	GitRepositorySourceId,
	GitRepositorySourceType,
	DockerImageSourceType,
	Sources,
	GitRepositorySource,
	SourceId,
	DockerRegistrySource,
	Source,
} from '../../lib/collections/Sources'
import * as _ from 'underscore'
import { Jobs } from 'meteor/wildhart:jobs'
import { assertNever, getCurrentTime, literal } from '../../lib/lib'
import { logger } from '../../lib/logging'
import { purgeGit, scanGit } from './sources/git'
import { MethodContextAPI } from '../../lib/api/methods'
import { SourcesAPI, SourcesAPIMethods } from '../../lib/api/sources'
import { Random } from 'meteor/random'
import { protectString } from '../../lib/protectedString'
import { registerClassToMeteorMethods } from '../methods'
import { Meteor } from 'meteor/meteor'
import { scanRegistry } from './sources/docker'
import { check } from 'meteor/check'
import { checkUserAccess } from '../security/methods'
import { JobNames } from '../lib/jobs'

// Register jobs for refreshing various source types
Jobs.register({
	[JobNames.RefreshGit]: async function (sourceId: GitRepositorySourceId): Promise<void> {
		const source = Sources.findOne(sourceId) as GitRepositorySource | undefined
		if (!source) {
			throw new Error(`Source not found: "${sourceId}"`)
		}

		try {
			const refs = await scanGit(source._id, source.url, source.privateKey)
			Sources.update(sourceId, {
				$set: {
					refs,
					updated: getCurrentTime(),
				},
			})
		} catch (err) {
			logger.error(`Failed to refresh Git Repositiory: ${err}`)
		}

		this.replicate(REFRESH_JOB_CONFIG)
		this.success()
	},
	[JobNames.RefreshDocker]: async function (sourceId: DockerRegistrySourceId): Promise<void> {
		const source = Sources.findOne(sourceId) as DockerRegistrySource | undefined
		if (!source) {
			throw new Error(`Source not found: "${sourceId}"`)
		}

		try {
			const refs = await scanRegistry(source._id, source.repo, source.registry, source.username, source.password)
			Sources.update(sourceId, {
				$set: {
					refs,
					updated: getCurrentTime(),
				},
			})
		} catch (err) {
			logger.error(`Failed to refresh Docker Registry: ${err}`)
		}

		this.replicate(REFRESH_JOB_CONFIG)
		this.success()
	},
})

const REFRESH_JOB_CONFIG = literal<Partial<Jobs.JobConfig>>({
	in: {
		minutes: 3,
	},
	// don't start any other task in the queue, before the promise of the previous task resolves
	awaitAsync: true,
	// don't queue any new tasks, if there is a task on the same queue and with same arguments
	singular: true,
})

class SourcesAPIClass extends MethodContextAPI implements SourcesAPI {
	addDockerSource(sourceSpec: Omit<DockerRegistrySource, '_id' | 'refs'>): DockerRegistrySourceId {
		check(sourceSpec, Object)
		checkUserAccess(this)

		const newId = protectString<DockerRegistrySourceId>(Random.id())

		Sources.insert({
			...sourceSpec,
			registry: sourceSpec.registry || undefined,
			password: sourceSpec.password || undefined,
			passwordSet: (sourceSpec.password || undefined) !== undefined,
			username: sourceSpec.username || undefined,
			type: sourceSpec.type,
			refs: [],
			_id: newId,
		})

		return newId
	}
	addGitSource(sourceSpec: Omit<GitRepositorySource, '_id' | 'refs'>): GitRepositorySourceId {
		check(sourceSpec, Object)
		checkUserAccess(this)

		const newId = protectString<GitRepositorySourceId>(Random.id())

		Sources.insert({
			...sourceSpec,
			privateKey: sourceSpec.privateKey || undefined,
			type: sourceSpec.type,
			refs: [],
			_id: protectString(Random.id()),
		})

		return newId
	}
	changeGitSource(
		sourceId: GitRepositorySourceId,
		sourceSpec: Partial<Omit<GitRepositorySource, '_id' | 'refs'>>
	): void {
		check(sourceId, String)
		check(sourceSpec, Object)
		checkUserAccess(this)

		Sources.update(sourceId, {
			$set: _.omit(sourceSpec, ['_id']),
		})
	}
	changeDockerSource(
		sourceId: DockerRegistrySourceId,
		sourceSpec: Partial<Omit<DockerRegistrySource, '_id' | 'refs'>>
	): void {
		check(sourceId, String)
		check(sourceSpec, Object)
		checkUserAccess(this)

		Sources.update(sourceId, {
			$set: _.omit(sourceSpec, ['_id']),
			$unset: {
				registry: sourceSpec.registry || undefined === undefined ? true : undefined,
				password: sourceSpec.passwordSet === false ? true : undefined,
			},
		})
	}
	removeSource(sourceId: SourceId): void {
		check(sourceId, String)
		checkUserAccess(this)

		Sources.remove(sourceId)
	}
}

registerClassToMeteorMethods(SourcesAPIMethods, SourcesAPIClass, false)

function refreshSourceJobs(source: Source, oldSource?: Source): void {
	// Clean up any scheduled refresh jobs, so that we can set them up again from scratch
	let job: Jobs.JobDocument | false = false
	switch (source.type) {
		case GitRepositorySourceType.Tests:
			Jobs.clear('*', JobNames.RefreshGit, oldSource?._id ?? source._id)
			if (!source.enabled) break

			job = Jobs.run(JobNames.RefreshGit, source._id, REFRESH_JOB_CONFIG)
			break
		case DockerImageSourceType.Blueprints:
			Jobs.clear('*', JobNames.RefreshDocker, oldSource?._id ?? source._id)
			if (!source.enabled) break

			job = Jobs.run(JobNames.RefreshDocker, source._id, REFRESH_JOB_CONFIG)
			break
		case DockerImageSourceType.Core:
			Jobs.clear('*', JobNames.RefreshDocker, oldSource?._id ?? source._id)
			if (!source.enabled) break

			job = Jobs.run(JobNames.RefreshDocker, source._id, REFRESH_JOB_CONFIG)
			break
		default:
			assertNever(source)
			break
	}

	if (job === false) {
		logger.warn(`Job not scheduled for source "${source._id}"`)
		return
	}

	// Start the job immediately, so that we don't have to wait until "in" time after rebooting
	Jobs.execute(job._id)
}

function removeSourceJobs(source: Source): void {
	switch (source.type) {
		case GitRepositorySourceType.Tests:
			Jobs.clear('*', JobNames.RefreshGit, source._id)
			purgeGit(source._id).catch((err) => {
				logger.error(`Could not clean up temporary git repo for Source "${source._id}": ${err}`)
			})
			break
		case DockerImageSourceType.Blueprints:
			Jobs.clear('*', JobNames.RefreshDocker, source._id)
			break
		case DockerImageSourceType.Core:
			Jobs.clear('*', JobNames.RefreshDocker, source._id)
			break
		default:
			assertNever(source)
			break
	}
}

// Set up the source Jobs when starting up
Meteor.startup(() => {
	Jobs.run(JobNames.CleanUpCompletedJobs, REFRESH_JOB_CONFIG)
})

// React to changes in the Sources collection and schedule jobs for refreshing the Sources
Sources.find(
	{},
	{
		fields: {
			updated: 0,
			refs: 0,
		},
	}
).observe({
	added: refreshSourceJobs,
	changed: refreshSourceJobs,
	removed: removeSourceJobs,
})
