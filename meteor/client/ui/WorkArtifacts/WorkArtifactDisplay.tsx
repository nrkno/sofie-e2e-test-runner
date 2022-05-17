import { CContainer } from '@coreui/react'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { ArtifactType, WorkArtifact } from '../../../lib/collections/WorkArtifact'
import { assertNever } from '../../../lib/lib'

export const WorkArtifactDisplay: React.FC<{ artifact: WorkArtifact }> = function WorkArtifactDisplay({ artifact }) {
	switch (artifact.type) {
		case ArtifactType.NumberArray:
			return (
				<CContainer
					md
					className="bg-dark font-monospace text-light border rounded p-2 mb-3 overflow-auto"
					style={{ maxHeight: '25vh' }}
				>
					<pre className="m-0">{JSON.stringify(artifact.artifact, undefined)}</pre>
				</CContainer>
			)
		case ArtifactType.JSON:
		case ArtifactType.MochawesomeReport:
			return (
				<CContainer
					md
					className="bg-dark font-monospace text-light border rounded p-2 mb-3 overflow-auto"
					style={{ maxHeight: '25vh' }}
				>
					<pre className="m-0">{JSON.stringify(artifact.artifact, undefined, 2)}</pre>
				</CContainer>
			)
		case ArtifactType.PassFail:
			return (
				<p className="fs-1">
					{artifact.artifact === 'pass' ? (
						<>
							<FontAwesomeIcon icon={faCheck} className="text-success" /> Pass
						</>
					) : (
						<>
							<FontAwesomeIcon icon={faXmark} className="text-danger" /> Fail
						</>
					)}
				</p>
			)
		case ArtifactType.Boolean:
			return <p className="fs-1">{artifact.artifact === true ? 'True' : 'False'}</p>
		case ArtifactType.Video:
			return (
				<CContainer md className="border rounded p-2 mb-3" style={{ maxWidth: '720px' }}>
					<video src={artifact.artifact.url} className="img-fluid" controls />
				</CContainer>
			)
		case ArtifactType.Image:
			return (
				<CContainer md className="border rounded p-2 mb-3" style={{ maxWidth: '720px' }}>
					<img src={artifact.artifact.url} className="img-fluid" />
				</CContainer>
			)
		case ArtifactType.Binary:
			return (
				<CContainer md className="border rounded p-2 mb-3">
					<a href={artifact.artifact.url} download>
						Download
					</a>
				</CContainer>
			)
		case ArtifactType.CSV:
			return (
				<CContainer
					md
					className="bg-dark font-monospace text-light border rounded p-2 mb-3 overflow-auto"
					style={{ maxHeight: '25vh' }}
				>
					<pre className="m-0">{artifact.artifact}</pre>
				</CContainer>
			)
		default:
			assertNever(artifact)
			return (
				<CContainer md className="border rounded p-2 mb-3 bg-danger">
					Unknown artifact type
				</CContainer>
			)
	}
}
