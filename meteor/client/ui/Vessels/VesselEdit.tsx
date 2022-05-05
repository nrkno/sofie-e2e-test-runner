import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormText, CFormTextarea, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { Random } from 'meteor/random'
import React from 'react'
import { useParams } from 'react-router-dom'
import { PubSub } from '../../../lib/api/pubsub'
import { literal } from '../../../lib/lib'
import { protectString } from '../../../lib/protectedString'
import { useSubscription } from '../../lib/ReactMeteorData/ReactMeteorData'
import { MeteorCall } from '../../../lib/api/methods'
import { useOneCollectionObject } from '../lib/useCollectionObject'
import { Vessel, VesselId, Vessels } from '../../../lib/collections/Vessels'

export const VesselEdit: React.FC = function VesselEdit() {
	const params = useParams()
	const navigate = useNavigate()

	const id = params['id'] ?? undefined

	const ready = useSubscription(PubSub.vessels, {
		_id: id,
	})

	const [vesselObj, setVesselObj] = useOneCollectionObject(
		Vessels,
		protectString<VesselId>(id),
		{
			fields: {
				privateKey: 0,
			},
		},
		literal<Vessel>({
			_id: protectString(Random.id()),
			host: '',
			privateKeySet: false,
			remoteDirectory: '',
			username: '',
			tags: [],
		}),
		ready
	)

	function onSubmit(e) {
		if (id) {
			MeteorCall.vessels.changeVessel(protectString(id), vesselObj)
		} else {
			MeteorCall.vessels.addVessel(vesselObj)
		}
		e.preventDefault()
		navigate('/vessels')
	}

	return (
		<CForm onSubmit={onSubmit}>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Hostname</CFormLabel>
					<CFormInput
						type="text"
						placeholder="New Vessel Hostname"
						value={vesselObj.host}
						onChange={(e) =>
							setVesselObj({
								...vesselObj,
								host: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Username</CFormLabel>
					<CFormInput
						type="text"
						placeholder="Username"
						value={vesselObj.username}
						onChange={(e) =>
							setVesselObj({
								...vesselObj,
								username: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Tags</CFormLabel>
					<CFormInput
						type="text"
						value={vesselObj.tags.join(', ')}
						onChange={(e) =>
							setVesselObj({
								...vesselObj,
								tags: e.target.value.split(/[,\s]+/gi),
							})
						}
						onKeyUp={(e) => {
							if (e.code === 'Backspace' && vesselObj.tags[vesselObj.tags.length - 1] === '') {
								setVesselObj({
									...vesselObj,
									tags: vesselObj.tags.slice(0, vesselObj.tags.length - 1),
								})
							}
						}}
						onBlur={(e) => {
							setVesselObj({
								...vesselObj,
								tags: e.target.value.split(/[,\s]+/gi).filter(Boolean),
							})
						}}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>SSH Key</CFormLabel>
					<CFormTextarea
						value={vesselObj.privateKey}
						onChange={(e) =>
							setVesselObj({
								...vesselObj,
								privateKey: e.target.value,
							})
						}
					/>
					<CFormText>SSH key to be used when connecting via SSH</CFormText>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Remote Directory</CFormLabel>
					<CFormInput
						type="text"
						placeholder=""
						value={vesselObj.remoteDirectory}
						onChange={(e) =>
							setVesselObj({
								...vesselObj,
								remoteDirectory: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CButton className="me-2" type="submit">
						{id ? 'Save' : 'Create'}
					</CButton>
					<CButton className="me-2" onClick={() => navigate('/vessels')} variant="outline">
						Cancel
					</CButton>
				</CCol>
			</CRow>
		</CForm>
	)
}
