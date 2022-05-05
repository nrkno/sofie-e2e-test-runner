import React from 'react'
import {
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
import { VesselId, Vessels } from '../../../lib/collections/Vessels'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { protectString, unprotectString } from '../../../lib/protectedString'
import { PubSub } from '../../../lib/api/pubsub'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { MeteorCall } from '../../../lib/api/methods'

const TABLE_COLS = 2

export const VesselList: React.FC = function VesselList() {
	const vessels = useTracker(
		() =>
			Vessels.find(
				{},
				{
					sort: {
						host: 1,
					},
				}
			).fetch(),
		[],
		[]
	)
	const navigate = useNavigate()
	const ready = useSubscription(PubSub.vessels, {})

	function removeSource(vesselId: VesselId) {
		MeteorCall.vessels.removeVessel(vesselId)
	}

	function onEdit(e: React.MouseEvent<HTMLButtonElement>) {
		const sourceId = e.currentTarget.dataset['vesselId']
		if (!sourceId) throw new Error('Vessel ID not found on element')
		navigate(`${sourceId}`)
	}

	function onRemove(e: React.MouseEvent<HTMLButtonElement>) {
		const sourceId = e.currentTarget.dataset['vesselId']
		if (!sourceId) throw new Error('Vessel ID not found on element')
		removeSource(protectString(sourceId))
	}

	function onAdd() {
		navigate(`new`)
	}

	return (
		<CTable striped align="middle">
			<CTableHead>
				<CTableRow>
					<CTableHeaderCell>Host</CTableHeaderCell>
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
				{ready && vessels.length === 0 && (
					<CTableRow>
						<CTableDataCell colSpan={TABLE_COLS} className="text-center">
							No vessels
						</CTableDataCell>
					</CTableRow>
				)}
				{ready &&
					vessels.length > 0 &&
					vessels.map((vessel) => (
						<CTableRow key={unprotectString(vessel._id)}>
							<CTableHeaderCell>{vessel.host}</CTableHeaderCell>
							<CTableDataCell>
								<CButtonGroup className="float-end" role="group" size="sm">
									<CButton variant="outline" title="Edit" data-vessel-id={vessel._id} onClick={onEdit}>
										<FontAwesomeIcon icon={faPencil} />
									</CButton>
									<CButton variant="outline" title="Remove" data-vessel-id={vessel._id} onClick={onRemove}>
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
