import React from 'react'
import Moment from 'react-moment'
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
import { SourceId, Sources } from '../../../lib/collections/Sources'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { protectString, unprotectString } from '../../../lib/protectedString'
import { getSourceDescription } from './lib'
import { PubSub } from '../../../lib/api/pubsub'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { MeteorCall } from '../../../lib/api/methods'

const TABLE_COLS = 7

export const SourceList: React.FC = function SourceList() {
	const sources = useTracker(
		() =>
			Sources.find(
				{},
				{
					sort: {
						name: 1,
					},
				}
			).fetch(),
		[],
		[]
	)
	const navigate = useNavigate()
	const ready = useSubscription(PubSub.sources, {})

	function removeSource(sourceId: SourceId) {
		MeteorCall.sources.removeSource(sourceId)
	}

	function onEdit(e: React.MouseEvent<HTMLButtonElement>) {
		const sourceId = e.currentTarget.dataset['sourceId']
		if (!sourceId) throw new Error('Source ID not found on element')
		navigate(`${sourceId}`)
	}

	function onRemove(e: React.MouseEvent<HTMLButtonElement>) {
		const sourceId = e.currentTarget.dataset['sourceId']
		if (!sourceId) throw new Error('Source ID not found on element')
		removeSource(protectString(sourceId))
	}

	function onAdd() {
		navigate(`new`)
	}

	return (
		<CTable striped align="middle">
			<CTableHead>
				<CTableRow>
					<CTableHeaderCell>Name</CTableHeaderCell>
					<CTableHeaderCell>{/** Enabled */}</CTableHeaderCell>
					<CTableHeaderCell>Type</CTableHeaderCell>
					<CTableHeaderCell>Location</CTableHeaderCell>
					<CTableHeaderCell>Tags</CTableHeaderCell>
					<CTableHeaderCell>Updated</CTableHeaderCell>
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
				{ready && sources.length === 0 && (
					<CTableRow>
						<CTableDataCell colSpan={TABLE_COLS} className="text-center">
							No sources
						</CTableDataCell>
					</CTableRow>
				)}
				{ready &&
					sources.length > 0 &&
					sources.map((source) => (
						<CTableRow key={unprotectString(source._id)}>
							<CTableHeaderCell>
								{source.name}
								<CBadge shape="rounded-pill" color="primary" className="ms-1" title="Available images">
									{source.refs.length}
								</CBadge>
							</CTableHeaderCell>
							<CTableDataCell></CTableDataCell>
							<CTableDataCell>{source.type}</CTableDataCell>
							<CTableDataCell>{getSourceDescription(source)}</CTableDataCell>
							<CTableDataCell>
								{source.tags.map((tag) => (
									<CBadge color="dark" shape="rounded" key={tag} className="me-1">
										{tag}
									</CBadge>
								))}
							</CTableDataCell>
							<CTableDataCell>
								{source.updated && <Moment fromNow>{source.updated}</Moment>}
								{!source.updated && <span className="fst-italic">Not yet fetched</span>}
							</CTableDataCell>
							<CTableDataCell>
								<CButtonGroup className="float-end" role="group" size="sm">
									<CButton variant="outline" title="Edit" data-source-id={source._id} onClick={onEdit}>
										<FontAwesomeIcon icon={faPencil} />
									</CButton>
									<CButton variant="outline" title="Remove" data-source-id={source._id} onClick={onRemove}>
										<FontAwesomeIcon icon={faTrash} />
									</CButton>
								</CButtonGroup>
							</CTableDataCell>
						</CTableRow>
					))}
				<CTableRow>
					<CTableDataCell colSpan={TABLE_COLS} className="text-center">
						<CButton className="float-end" variant="outline" size="sm" onClick={onAdd}>
							<FontAwesomeIcon icon={faPlus} /> Add
						</CButton>
					</CTableDataCell>
				</CTableRow>
			</CTableBody>
		</CTable>
	)
}
