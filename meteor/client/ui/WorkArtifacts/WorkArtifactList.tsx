import { CContainer, CSpinner } from '@coreui/react'
import React, { useMemo } from 'react'
import _ from 'underscore'
import { PubSub } from '../../../lib/api/pubsub'
import { ArtifactType, WorkArtifact, WorkArtifacts } from '../../../lib/collections/WorkArtifact'
import { WorkOrderId } from '../../../lib/collections/WorkOrder'
import { Time, literal } from '../../../lib/lib'
import { MongoSelector } from '../../../lib/mongo'
import { unprotectString } from '../../../lib/protectedString'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { WorkArtifactCard } from './WorkArtifactCard'

interface IProps {
	workOrderId?: WorkOrderId | WorkOrderId[]
	tags?: string[]
	createdAfter?: Time
	createdBefore?: Time
	type?: ArtifactType | ArtifactType[]
}

export const WorkArtifactList: React.FC<IProps> = function WorkArtifactList({
	workOrderId,
	tags,
	createdAfter,
	createdBefore,
	type,
}) {
	const selector = useMemo<MongoSelector<WorkArtifact>>(
		() =>
			literal<MongoSelector<WorkArtifact>>(
				_.omit(
					{
						workOrderId: Array.isArray(workOrderId)
							? {
									$in: workOrderId,
							  }
							: workOrderId,
						tags,
						created:
							createdAfter || createdBefore
								? {
										$gt: createdAfter,
										$lt: createdBefore,
								  }
								: undefined,
						type: Array.isArray(type)
							? {
									$in: type,
							  }
							: type,
					},
					// eslint-disable-next-line @typescript-eslint/unbound-method
					_.isEmpty
				)
			),
		[workOrderId, tags, createdAfter, createdBefore, type]
	)
	const ready = useSubscription(PubSub.workArtifacts, selector)

	const artifactIds = useTracker(
		() => WorkArtifacts.find(selector, { fields: { _id: 1 } }).map((artifact) => artifact._id),
		[selector],
		[]
	)

	return (
		<>
			{!ready && <CSpinner />}
			{ready && artifactIds.length === 0 && <p>No artifacts</p>}
			{ready && artifactIds.length > 0 && (
				<CContainer className="px-0">
					{artifactIds.map((artifactId) => (
						<WorkArtifactCard key={unprotectString(artifactId)} artifactId={artifactId} />
					))}
				</CContainer>
			)}
		</>
	)
}
