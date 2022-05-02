import {
	DockerRegistrySourceId,
	GitRepositorySourceId,
	GitRepositorySourceType,
	DockerImageSourceType,
	Sources,
	GitRepositorySource,
	SourceId,
	DockerRegistrySource,
} from '../../lib/collections/Sources'
import { Jobs } from 'meteor/wildhart:jobs'
import { assertNever, literal } from '../../lib/lib'
import { logger } from '../../lib/logging'
import { scanGit } from './sources/git'
import { MethodContextAPI } from '../../lib/api/methods'
import { SourcesAPI, SourcesAPIMethods } from '../../lib/api/sources'
import { Random } from 'meteor/random'
import { protectString } from '../../lib/protectedString'
import { registerClassToMeteorMethods } from '../methods'

enum JobNames {
	RefreshGit = 'refreshGit',
	RefreshDocker = 'refreshDocker',
}

Jobs.configure({
	startupDelay: 1000,
})

// Register jobs for refreshing various source types
Jobs.register({
	[JobNames.RefreshGit]: function (sourceId: GitRepositorySourceId) {
		const source = Sources.findOne(sourceId) as GitRepositorySource | undefined
		if (!source) {
			throw new Error(`Source not found: "${sourceId}"`)
		}

		scanGit(source._id, source.url, source.sshKey)
			.then((refs) => {
				Sources.update(sourceId, {
					$set: {
						refs,
					},
				})
				this.replicate(REFRESH_JOB_CONFIG)
				this.success()
			})
			.catch((err) => {
				logger.error(`Failed to refresh Git Repositiory: ${err}`)
				this.replicate(REFRESH_JOB_CONFIG)
				this.success()
			})
	},
	[JobNames.RefreshDocker]: function (_sourceId: DockerRegistrySourceId) {
		this.replicate(REFRESH_JOB_CONFIG)
		this.success()
	},
})

const REFRESH_JOB_CONFIG = literal<Partial<Jobs.JobConfig>>({
	in: {
		// minutes: 5,
		seconds: 10,
	},
	awaitAsync: true,
	singular: true,
})

class SourcesAPIClass extends MethodContextAPI implements SourcesAPI {
	addDockerSource(sourceSpec: Omit<DockerRegistrySource, '_id' | 'refs'>): void {
		Sources.insert({
			...sourceSpec,
			type: sourceSpec.type,
			refs: [],
			_id: protectString(Random.id()),
		})
	}
	addGitSource(sourceSpec: Omit<GitRepositorySource, '_id' | 'refs'>): void {
		Sources.insert({
			...sourceSpec,
			type: sourceSpec.type,
			refs: [],
			_id: protectString(Random.id()),
		})
	}
	removeSource(sourceId: SourceId): void {
		Sources.remove(sourceId)
	}
}

registerClassToMeteorMethods(SourcesAPIMethods, SourcesAPIClass, false)

function refreshSourceJobs() {
	// Clean up any scheduled refresh jobs, so that we can set them up again from scratch
	Jobs.clear('*', 'refreshGit')
	Jobs.clear('*', 'refreshDocker')

	Sources.find().forEach((source) => {
		let job: Jobs.JobDocument | false = false
		switch (source.type) {
			case GitRepositorySourceType.Tests:
				job = Jobs.run(JobNames.RefreshGit, source._id, REFRESH_JOB_CONFIG)
				break
			case DockerImageSourceType.Blueprints:
				job = Jobs.run(JobNames.RefreshDocker, source._id, REFRESH_JOB_CONFIG)
				break
			case DockerImageSourceType.Core:
				job = Jobs.run(JobNames.RefreshDocker, source._id, REFRESH_JOB_CONFIG)
				break
			default:
				assertNever(source)
				break
		}

		if (job === false) {
			logger.warn(`Job not started for source "${source._id}"`)
			return
		}

		// Start the job immediately, so that we don't have to wait until "in" time after rebooting
		Jobs.execute(job._id)
	})
}

// React to changes in the Sources collection and schedule jobs for refreshing the Sources
Sources.find().observe({
	added: refreshSourceJobs,
	changed: refreshSourceJobs,
	removed: refreshSourceJobs,
})
