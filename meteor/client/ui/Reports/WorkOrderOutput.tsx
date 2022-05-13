import React from 'react'
import { CContainer, CSpinner } from '@coreui/react'
import { PubSub } from '../../../lib/api/pubsub'
import { WorkOrderId } from '../../../lib/collections/WorkOrder'
import { WorkOrderOutputs } from '../../../lib/collections/WorkOrderOutput'
import { useSubscription, useTracker } from '../../lib/ReactMeteorData/ReactMeteorData'
import { unprotectString } from '../../../lib/protectedString'
import classNames from 'classnames'

interface IProps {
	commandline: string[]
	workOrderId: WorkOrderId
}

export const WorkOrderOutput: React.FC<IProps> = ({ commandline, workOrderId }) => {
	const outputsReady = useSubscription(PubSub.workOrderOutputs, {
		workOrderId,
	})

	const outputs = useTracker(
		() =>
			WorkOrderOutputs.find({
				workOrderId,
			}).fetch(),
		[workOrderId],
		[]
	)

	return (
		<>
			<h4>Command Line</h4>
			<CContainer md className="bg-dark font-monospace text-light border rounded p-2 mb-3">
				<pre className="m-0">{commandline.join(' ')}</pre>
			</CContainer>
			{!outputsReady && (
				<CContainer className="text-center">
					<CSpinner />
				</CContainer>
			)}
			{outputsReady && (
				<>
					<h4>Output</h4>
					<CContainer md className="bg-dark font-monospace text-light border rounded p-2">
						{outputs.map((line) => (
							<pre
								key={unprotectString(line._id)}
								className={classNames('m-0', {
									'text-danger': line.type === 'stderr',
								})}
							>
								{line.data}
							</pre>
						))}
					</CContainer>
				</>
			)}
		</>
	)
}
