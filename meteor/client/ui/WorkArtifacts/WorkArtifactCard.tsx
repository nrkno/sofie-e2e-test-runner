import { CBadge, CCard, CCardBody, CCardText } from '@coreui/react'
import React from 'react'
import { WorkArtifactId, WorkArtifacts } from '../../../lib/collections/WorkArtifact'
import { unprotectString } from '../../../lib/protectedString'
import { useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { WorkArtifactDisplay } from './WorkArtifactDisplay'

interface IProps {
	artifactId: WorkArtifactId
}

export const WorkArtifactCard: React.FC<IProps> = function WorkArtifactCard({ artifactId }) {
	const artifact = useTracker(() => WorkArtifacts.findOne(artifactId), [artifactId], null)

	if (!artifact) {
		return null
	}

	return (
		<CCard key={unprotectString(artifact._id)} className="my-2">
			<CCardBody>
				{artifact.name && <h5>{artifact.name}</h5>}
				<WorkArtifactDisplay artifact={artifact} />
				<CCardText>
					{artifact.tags.map((tag) => (
						<CBadge color="dark" shape="rounded" key={tag} className="me-1">
							{tag}
						</CBadge>
					))}
				</CCardText>
			</CCardBody>
		</CCard>
	)
}
