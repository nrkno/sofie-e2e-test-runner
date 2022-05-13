import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { useParams } from 'react-router-dom'
import { PubSub } from '../../../lib/api/pubsub'
import { literal } from '../../../lib/lib'
import { protectString, unprotectString } from '../../../lib/protectedString'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { MeteorCall } from '../../../lib/api/methods'
import { useOneCollectionObject } from '../lib/useCollectionObject'
import { WorkOrder, WorkOrderId, WorkOrders, WorkOrderStatus } from '../../../lib/collections/WorkOrder'
import _ from 'underscore'
import { DockerImageSourceType, GitRepositorySourceType, Source, Sources } from '../../../lib/collections/Sources'
import { WorkOrderOutput } from './WorkOrderOutput'

function OptionsFromSources({ sources, separator }: { sources: Source[]; separator?: string }) {
	return (
		<>
			<option disabled value={separator ?? ':'} selected>
				Not set
			</option>
			{sources.map((source) => (
				<optgroup label={source.name} key={unprotectString(source._id)}>
					{source.refs.map((ref) => (
						<option key={ref} value={source._id + (separator ?? ':') + ref}>
							{ref}
						</option>
					))}
				</optgroup>
			))}
		</>
	)
}

export const WorkOrderEdit: React.FC = function WorkOrderEdit() {
	const params = useParams()
	const navigate = useNavigate()

	const id = params['id'] ?? undefined

	const workOrderReady = useSubscription(PubSub.workOrders, {
		_id: id,
	})
	const _artifactsReady = useSubscription(PubSub.workArtifacts, {
		workOrderId: id,
	})
	const _sourcesReady = useSubscription(PubSub.sources, {})

	const [workOrderObj, setWorkOrderObj] = useOneCollectionObject(
		WorkOrders,
		protectString<WorkOrderId>(id),
		{},
		literal<WorkOrder>({
			_id: protectString(''),
			blueprintSource: protectString(''),
			blueprintSourceRef: '',
			coreSource: protectString(''),
			coreSourceRef: '',
			testSuiteSource: protectString(''),
			testSuiteSourceRef: '',
			tags: [],
			created: 0,
			commandline: [],
			status: WorkOrderStatus.Waiting,
		}),
		workOrderReady
	)

	function onSubmit(e) {
		if (id) {
			MeteorCall.workOrders.changeWorkOrder(
				protectString(id),
				_.omit(workOrderObj, ['_id', 'created', 'commandline', 'status'])
			)
		} else {
			const id = MeteorCall.workOrders.addWorkOrder(_.omit(workOrderObj, ['_id', 'created', 'commandline', 'status']))
			console.log(id)
		}
		e.preventDefault()
		navigate('/reports')
	}

	const coreSources = useTracker(() => Sources.find({ type: DockerImageSourceType.Core }).fetch(), [], [])
	const blueprintSources = useTracker(() => Sources.find({ type: DockerImageSourceType.Blueprints }).fetch(), [], [])
	const suiteSources = useTracker(() => Sources.find({ type: GitRepositorySourceType.Tests }).fetch(), [], [])

	const editable = workOrderObj.status === WorkOrderStatus.Waiting
	const hasOutput = workOrderObj.status !== WorkOrderStatus.Waiting && workOrderObj.status !== WorkOrderStatus.Cancelled

	return (
		<CForm onSubmit={onSubmit}>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Core Source</CFormLabel>
					<CFormSelect
						value={workOrderObj.coreSource + ':' + workOrderObj.coreSourceRef}
						onChange={(e) =>
							setWorkOrderObj({
								...workOrderObj,
								coreSource: protectString(e.target.value.split(':')[0]),
								coreSourceRef: e.target.value.split(':')[1],
							})
						}
						disabled={!editable}
					>
						<OptionsFromSources sources={coreSources} />
					</CFormSelect>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Blueprint Source</CFormLabel>
					<CFormSelect
						value={workOrderObj.blueprintSource + ':' + workOrderObj.blueprintSourceRef}
						onChange={(e) =>
							setWorkOrderObj({
								...workOrderObj,
								blueprintSource: protectString(e.target.value.split(':')[0]),
								blueprintSourceRef: e.target.value.split(':')[1],
							})
						}
						disabled={!editable}
					>
						<OptionsFromSources sources={blueprintSources} />
					</CFormSelect>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Tests Suite Source</CFormLabel>
					<CFormSelect
						value={workOrderObj.testSuiteSource + ':' + workOrderObj.testSuiteSourceRef}
						onChange={(e) =>
							setWorkOrderObj({
								...workOrderObj,
								testSuiteSource: protectString(e.target.value.split(':')[0]),
								testSuiteSourceRef: e.target.value.split(':')[1],
							})
						}
						disabled={!editable}
					>
						<OptionsFromSources sources={suiteSources} />
					</CFormSelect>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Tags</CFormLabel>
					<CFormInput
						type="text"
						value={workOrderObj.tags.join(', ')}
						disabled={!editable}
						onChange={(e) =>
							setWorkOrderObj({
								...workOrderObj,
								tags: e.target.value.split(/[,\s]+/gi),
							})
						}
						onKeyUp={(e) => {
							if (e.code === 'Backspace' && workOrderObj.tags[workOrderObj.tags.length - 1] === '') {
								setWorkOrderObj({
									...workOrderObj,
									tags: workOrderObj.tags.slice(0, workOrderObj.tags.length - 1),
								})
							}
						}}
						onBlur={(e) => {
							setWorkOrderObj({
								...workOrderObj,
								tags: e.target.value.split(/[,\s]+/gi).filter(Boolean),
							})
						}}
					/>
				</CCol>
			</CRow>
			{editable && (
				<CRow className="mb-3">
					<CCol xs>
						<CButton className="me-2" type="submit">
							{id ? 'Save' : 'Create'}
						</CButton>
						<CButton className="me-2" onClick={() => navigate('/reports')} variant="outline">
							Cancel
						</CButton>
					</CCol>
				</CRow>
			)}
			{hasOutput && <WorkOrderOutput commandline={workOrderObj.commandline} workOrderId={workOrderObj._id} />}
		</CForm>
	)
}
