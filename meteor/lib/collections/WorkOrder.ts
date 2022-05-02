import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'

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
	coreSource: string
	blueprintSource: string
	status: WorkOrderStatus
	tags: string[]
}

export const WorkOrders = createMongoCollection<WorkOrder>(CollectionName.WorkOrders)
registerIndex(WorkOrders, {
	_id: 1,
})