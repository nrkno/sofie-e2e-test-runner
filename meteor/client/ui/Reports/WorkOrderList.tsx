import {
	CBadge,
	CButton,
	CButtonGroup,
	CSpinner,
	CTable,
	CTableBody,
	CTableDataCell,
	CTableHead,
	CTableHeaderCell,
	CTableRow,
} from '@coreui/react'
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { MeteorCall } from '../../../lib/api/methods'
import { PubSub } from '../../../lib/api/pubsub'
import { WorkOrderId, WorkOrders } from '../../../lib/collections/WorkOrder'
import { protectString, unprotectString } from '../../../lib/protectedString'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { WorkOrderStatusIcon } from './WorkOrderStatusIcon'

const TABLE_COLS = 7

export const WorkOrderList: React.FC = function () {
	const workOrders = useTracker(
		() =>
			WorkOrders.find(
				{},
				{
					sort: {
						created: -1,
					},
				}
			).fetch(),
		[],
		[]
	)
	const navigate = useNavigate()
	const ready = useSubscription(PubSub.workOrders, {})

	function removeWorkOrder(workOrderId: WorkOrderId) {
		MeteorCall.workOrders.removeWorkOrder(workOrderId)
	}

	function onEdit(e: React.MouseEvent<HTMLButtonElement>) {
		const workOrderId = e.currentTarget.dataset['workOrderId']
		if (!workOrderId) throw new Error('WorkOrder ID not found on element')
		navigate(`${workOrderId}`)
	}

	function onRemove(e: React.MouseEvent<HTMLButtonElement>) {
		const workOrderId = e.currentTarget.dataset['workOrderId']
		if (!workOrderId) throw new Error('WorkOrder ID not found on element')
		removeWorkOrder(protectString(workOrderId))
	}

	function onAdd() {
		navigate(`new`)
	}

	return (
		<CTable striped align="middle">
			<CTableHead>
				<CTableRow>
					<CTableHeaderCell>{/** Status */}</CTableHeaderCell>
					<CTableHeaderCell>ID</CTableHeaderCell>
					<CTableHeaderCell>Core Image</CTableHeaderCell>
					<CTableHeaderCell>Blueprints Image</CTableHeaderCell>
					<CTableHeaderCell>Tags</CTableHeaderCell>
					<CTableHeaderCell>Created</CTableHeaderCell>
					<CTableHeaderCell></CTableHeaderCell>
				</CTableRow>
			</CTableHead>
			<CTableBody>
				{!ready && (
					<CTableRow>
						<CTableDataCell colSpan={TABLE_COLS} className="text-center">
							<CSpinner />
						</CTableDataCell>
					</CTableRow>
				)}
				{ready && workOrders.length === 0 && (
					<CTableRow>
						<CTableDataCell colSpan={TABLE_COLS} className="text-center">
							No reports
						</CTableDataCell>
					</CTableRow>
				)}
				{ready &&
					workOrders.length > 0 &&
					workOrders.map((workOrder) => (
						<CTableRow key={unprotectString(workOrder._id)}>
							<CTableDataCell>
								<WorkOrderStatusIcon status={workOrder.status} />
							</CTableDataCell>
							<CTableHeaderCell className="font-monospace">
								{unprotectString(workOrder._id).substring(0, 5)}
							</CTableHeaderCell>
							<CTableDataCell>{workOrder.coreSourceRef}</CTableDataCell>
							<CTableDataCell>{workOrder.blueprintSourceRef}</CTableDataCell>
							<CTableDataCell>
								{workOrder.tags.map((tag) => (
									<CBadge color="dark" shape="rounded" key={tag} className="me-1">
										{tag}
									</CBadge>
								))}
							</CTableDataCell>
							<CTableDataCell>{workOrder.created && <Moment fromNow>{workOrder.created}</Moment>}</CTableDataCell>
							<CTableDataCell>
								<CButtonGroup className="float-end" role="group" size="sm">
									<CButton variant="outline" title="Edit" data-work-order-id={workOrder._id} onClick={onEdit}>
										<FontAwesomeIcon icon={faPencil} />
									</CButton>
									<CButton variant="outline" title="Remove" data-work-order-id={workOrder._id} onClick={onRemove}>
										<FontAwesomeIcon icon={faTrash} />
									</CButton>
								</CButtonGroup>
							</CTableDataCell>
						</CTableRow>
					))}
				<CTableRow>
					<CTableDataCell colSpan={TABLE_COLS} className="border-bottom-0">
						<CButton className="float-end" variant="outline" size="sm" onClick={onAdd}>
							<FontAwesomeIcon icon={faPlus} /> Add
						</CButton>
					</CTableDataCell>
				</CTableRow>
			</CTableBody>
		</CTable>
	)
}
