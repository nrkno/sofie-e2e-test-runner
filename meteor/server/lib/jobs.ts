import { Jobs } from 'meteor/wildhart:jobs'
import { literal } from '../../lib/lib'

export enum JobNames {
	RefreshGit = 'refreshGit',
	RefreshDocker = 'refreshDocker',
	CleanUpCompletedJobs = 'cleanUpCompletedJobs',
	StartOnWorkOrder = 'startOnWorkOrder',
	CleanUpOrphanedOutputsAndArtifacts = 'cleanUpOrphanedOutputsAndArtifacts',
}

Jobs.configure({
	startupDelay: 1000,
})

const CLEAN_UP_JOB_CONFIG = literal<Partial<Jobs.JobConfig>>({
	in: {
		minutes: 3,
	},
	// don't start any other task in the queue, before the promise of the previous task resolves
	awaitAsync: true,
	// don't queue any new tasks, if there is a task on the same queue and with same arguments
	singular: true,
})

Jobs.register({
	[JobNames.CleanUpCompletedJobs]: function () {
		Jobs.clear('success')
		Jobs.clear('failure')
		this.replicate(CLEAN_UP_JOB_CONFIG)
		this.success()
	},
})
