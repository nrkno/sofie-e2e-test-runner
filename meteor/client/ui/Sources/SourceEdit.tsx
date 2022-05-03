import { CButton, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react'
import * as _ from 'underscore'
import { useNavigate } from 'react-router-dom'
import { Random } from 'meteor/random'
import { Tracker } from 'meteor/tracker'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PubSub } from '../../../lib/api/pubsub'
import { DockerImageSourceType, GitRepositorySourceType, Source, Sources } from '../../../lib/collections/Sources'
import { assertNever, literal } from '../../../lib/lib'
import { protectString } from '../../../lib/protectedString'
import { useSubscription } from '../../lib/ReactMeteorData/ReactMeteorData'
import { MeteorCall } from '../../../lib/api/methods'

export const SourceEdit: React.FC = function SourceEdit() {
	const params = useParams()
	const navigate = useNavigate()

	const id = params['id'] ?? undefined

	const ready = useSubscription(PubSub.sources, {
		_id: id,
	})

	const [sourceObj, setSourceObj] = useState(
		literal<Source>({
			_id: protectString(Random.id()),
			type: GitRepositorySourceType.Tests,
			name: '',
			refs: [],
			tags: [],
			url: '',
		})
	)
	useEffect(() => {
		if (ready && id) {
			Tracker.nonreactive(() => {
				const source = Sources.findOne(protectString(id), {
					fields: {
						password: 0,
						sshKey: 0,
						updated: 0,
						refs: 0,
					},
				})
				console.log(id, source)
				if (source) {
					setSourceObj(source)
				}
			})
		}
	}, [ready, id])

	function onSubmit(e) {
		if (id) {
			switch (sourceObj.type) {
				case GitRepositorySourceType.Tests:
					MeteorCall.sources.changeGitSource(sourceObj._id, _.omit(sourceObj, ['refs', 'updated']))
					break
				case DockerImageSourceType.Blueprints:
				case DockerImageSourceType.Core:
					MeteorCall.sources.changeDockerSource(sourceObj._id, _.omit(sourceObj, ['refs', 'updated']))
					break
				default:
					assertNever(sourceObj)
			}
		} else {
			switch (sourceObj.type) {
				case GitRepositorySourceType.Tests:
					MeteorCall.sources.addGitSource(sourceObj)
					break
				case DockerImageSourceType.Blueprints:
				case DockerImageSourceType.Core:
					MeteorCall.sources.addDockerSource(sourceObj)
					break
				default:
					assertNever(sourceObj)
			}
		}
		e.preventDefault()
		navigate('/sources')
	}

	return (
		<CForm onSubmit={onSubmit}>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Source Name</CFormLabel>
					<CFormInput
						type="text"
						placeholder="New Source Name"
						size="lg"
						value={sourceObj.name}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								name: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Source Type</CFormLabel>
					<CFormSelect
						placeholder="Source Type"
						value={sourceObj.type}
						options={[GitRepositorySourceType.Tests, DockerImageSourceType.Blueprints, DockerImageSourceType.Core]}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								type: e.target.value as any,
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
						value={sourceObj.tags.join(', ')}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								tags: e.target.value.split(/[,\s]+/gi),
							})
						}
						onKeyUp={(e) => {
							if (e.code === 'Backspace' && sourceObj.tags[sourceObj.tags.length - 1] === '') {
								setSourceObj({
									...sourceObj,
									tags: sourceObj.tags.slice(0, sourceObj.tags.length - 1),
								})
							}
						}}
						onBlur={(e) => {
							setSourceObj({
								...sourceObj,
								tags: e.target.value.split(/[,\s]+/gi).filter(Boolean),
							})
						}}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormCheck
						checked={sourceObj.enabled ?? false}
						label="Enabled"
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								enabled: e.target.checked,
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
					<CButton className="me-2" onClick={() => navigate('/sources')} variant="outline">
						Cancel
					</CButton>
				</CCol>
			</CRow>
		</CForm>
	)
}
