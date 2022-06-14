import { CCol, CFormInput, CFormLabel, CFormText, CRow } from '@coreui/react'
import React from 'react'
import {
	CoreDockerRegistrySource as CoreDockerRegistrySource,
	DockerRegistrySource,
	Source,
} from '../../../lib/collections/Sources'

export const SourceCoreEdit: React.FC<{
	sourceObj: CoreDockerRegistrySource
	setSourceObj: React.Dispatch<React.SetStateAction<Source>>
}> = function SourceCoreEdit({ sourceObj, setSourceObj }) {
	return (
		<>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Repo name</CFormLabel>
					<CFormInput
						type="text"
						value={sourceObj.repo}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								repo: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Playout repo name</CFormLabel>
					<CFormInput
						type="text"
						value={sourceObj.playoutImage || ''}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								playoutImage: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Ingest repo name</CFormLabel>
					<CFormInput
						type="text"
						value={sourceObj.ingestImage || ''}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								ingestImage: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Registry Host (optional)</CFormLabel>
					<CFormInput
						value={sourceObj.registry}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								registry: e.target.value,
							})
						}
					/>
					<CFormText>Defaults to registry-1.docker.io, if not set</CFormText>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Username (optional)</CFormLabel>
					<CFormInput
						value={sourceObj.username ?? ''}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								username: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Password (optional)</CFormLabel>
					<CFormInput
						value={sourceObj.password ?? ''}
						type="password"
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								password: e.target.value,
							})
						}
					/>
				</CCol>
			</CRow>
		</>
	)
}
