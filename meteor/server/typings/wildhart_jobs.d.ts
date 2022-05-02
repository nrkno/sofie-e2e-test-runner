type TimeSpec = {
	milliseconds?: number
	seconds?: number
	minutes?: number
	hours?: number
	days?: number
	months?: number
	years?: number
	millisecond?: number
	second?: number
	minute?: number
	hour?: number
	day?: number
	month?: number
	year?: number
}

declare module 'meteor/wildhart:jobs' {
	export namespace Jobs {
		interface Config {
			startupDelay: number
			maxWait: number
			log: typeof console.log | boolean
			autoStart: boolean
			setServerId?: string | Function
			defaultCompletion?: 'success' | 'remove'
		}

		interface JobConfig {
			in: TimeSpec
			on: TimeSpec
			priority: number
			date: Date
			state: string
			awaitAsync: boolean
			unique: boolean
			singular: boolean
			callback?: Function
		}

		type JobStatus = 'pending' | 'success' | 'failure' | 'executing'

		interface JobDocument {
			_id: string
			name: string
			state: JobStatus
			arguments: any[]
			due: Date
			priority: number
			created: Date
			awaitAsync?: boolean
		}

		interface JobThisType {
			document: JobDocument
			replicate(config: Partial<JobConfig>): string | null
			reschedule(config: Partial<JobConfig>): void
			remove(): boolean
			success(): void
			failure(): void
		}

		type JobFunction = (this: JobThisType, ...args: any[]) => void
		type JobFunctions = Record<string, JobFunction>
		type RegisterFn = (jobFunctions: JobFunctions) => void

		let collection: Mongo.Collection<JobDocument>
		let jobs: JobFunctions

		function configure(options: Partial<Config>): void
		function register(jobFunctions: JobFunctions): void
		function run(jobName: string, ...args: any[]): JobDocument | false
		function execute(jobId: string): void
		function replicate(jobId: string, config: Partial<JobConfig>): string | null
		function reschedule(jobId: string, config: Partial<JobConfig>): void
		function remove(jobId: string): boolean
		function clear(state: '*' | JobStatus | JobStatus[], jobName: string, ...args: any[]): number
		function findOne(jobName: string, ...args: any[]): JobDocument
		function count(jobName: string, ...args: any[]): number
		function countPending(jobName: string, ...args: any[]): number
		function start(jobNames: string | string[]): void
		function stop(jobNames: string | string[]): void
	}
}
