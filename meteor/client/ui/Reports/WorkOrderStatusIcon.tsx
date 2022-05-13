import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faQuestionCircle,
	faBan,
	faXmark,
	faCircleExclamation,
	faCheck,
	faHourglassStart,
	faGears,
} from '@fortawesome/free-solid-svg-icons'
import { WorkOrderStatus } from '../../../lib/collections/WorkOrder'
import { assertNever } from '../../../lib/lib'

export const WorkOrderStatusIcon: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
	switch (status) {
		case WorkOrderStatus.Cancelled:
			return <FontAwesomeIcon icon={faBan} className="text-secondary" />
		case WorkOrderStatus.Failed:
			return <FontAwesomeIcon icon={faXmark} className="text-danger" />
		case WorkOrderStatus.FailedToRun:
			return <FontAwesomeIcon icon={faCircleExclamation} className="text-danger" />
		case WorkOrderStatus.Passed:
			return <FontAwesomeIcon icon={faCheck} className="text-success" />
		case WorkOrderStatus.Waiting:
			return <FontAwesomeIcon icon={faHourglassStart} className="text-secondary" />
		case WorkOrderStatus.Working:
			return <FontAwesomeIcon icon={faGears} className="text-primary" />
		default:
			assertNever(status)
			return <FontAwesomeIcon icon={faQuestionCircle} />
	}
}
