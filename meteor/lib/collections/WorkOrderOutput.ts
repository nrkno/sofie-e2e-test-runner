import { registerIndex } from '../database'
import { Time } from '../lib'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'
import { createMongoCollection } from './lib'
import { WorkOrderId } from './WorkOrder'

export type WorkOrderOutputId = ProtectedString<'WorkOrderOutputId'>

export interface WorkOrderOutput {
	_id: WorkOrderOutputId
	workOrderId: WorkOrderId
	timestamp: Time
	data: string
}

export const WorkOrderOutputs = createMongoCollection<WorkOrderOutput>(CollectionName.WorkOrderOutputs)
registerIndex(WorkOrderOutputs, {
	_id: 1,
})
registerIndex(WorkOrderOutputs, {
	workOrderId: 1,
	timestamp: 1,
})
