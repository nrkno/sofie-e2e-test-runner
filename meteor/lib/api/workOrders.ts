import { WorkOrder, WorkOrderId } from '../collections/WorkOrder'

export type PublicWorkOrder = Omit<WorkOrder, '_id' | 'created' | 'status' | 'commandline'>

export interface WorkOrdersAPI {
	addWorkOrder(workOrderSpec: PublicWorkOrder): WorkOrderId
	changeWorkOrder(workOrderId: WorkOrderId, workOrderSpec: Partial<PublicWorkOrder>): void
	/**
	 * This will remove the WorkOrder and all associated WorkOrderOutputs and WorkArtifacts
	 * @param workOrderId
	 */
	removeWorkOrder(workOrderId: WorkOrderId): void
}

export enum WorkOrdersAPIMethods {
	'addWorkOrder' = 'workOrders.addWorkOrder',
	'changeWorkOrder' = 'workOrders.changeWorkOrder',
	'removeVeremoveWorkOrderssel' = 'workOrders.removeWorkOrder',
}
