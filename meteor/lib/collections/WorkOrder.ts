import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'
import { SourceId } from './Sources'
import { Time } from '../lib'
import { VesselId } from './Vessels'

export type WorkOrderId = ProtectedString<'WorkOrderId'>

export enum WorkOrderStatus {
	Waiting = 'waiting',
	Working = 'working',
	Passed = 'passed',
	Failed = 'failed',
	Cancelled = 'cancelled',
	FailedToRun = 'failedToRun',
}

/**
 * Describes a single run of a set of tests,
 *
 * @export
 * @interface WorkOrder
 */
export interface WorkOrder {
	_id: WorkOrderId
	coreSource: SourceId
	coreSourceRef: string
	blueprintSource: SourceId
	blueprintSourceRef: string
	testSuiteSource: SourceId
	testSuiteSourceRef: string
	created: Time
	started?: Time
	finished?: Time
	vesselId?: VesselId
	status: WorkOrderStatus
	commandline: string[]
	tags: string[]
}

export const WorkOrders = createMongoCollection<WorkOrder>(CollectionName.WorkOrders)
registerIndex(WorkOrders, {
	_id: 1,
})
