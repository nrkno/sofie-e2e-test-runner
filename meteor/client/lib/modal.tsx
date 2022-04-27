import * as React from 'react'
import { Tracker } from 'meteor/tracker'
import { useTracker } from './ReactMeteorData/ReactMeteorData'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

const modalsDep = new Tracker.Dependency()
const activeModals: ModalOptions[] = []

export const ModalContainer: React.FC<{}> = function ModalContainer(props) {
	const latestModal: ModalOptions | undefined = useTracker(() => {
		modalsDep.depend()
		return activeModals[activeModals.length - 1]
	}, [])

	if (!latestModal) return null
	return (
		<CModal visible onClose={() => closeModal()} backdrop="static">
			<CModalHeader>
				<CModalTitle>{latestModal.title}</CModalTitle>
			</CModalHeader>

			<CModalBody>
				<p>{latestModal.content}</p>
			</CModalBody>

			<CModalFooter>
				{latestModal.actions.map((action, index) => {
					return (
						<CButton
							key={index}
							type="button"
							color={index === 0 ? 'primary' : 'secondary'}
							onClick={() => {
								action.fcn?.()
								closeModal()
							}}
						>
							{action.label}
						</CButton>
					)
				})}
			</CModalFooter>
		</CModal>
	)
}

export interface ModalOptions {
	title?: string
	content: string | JSX.Element
	actions: ModalOptionsAction[]
}
export interface ModalOptionsAction {
	label: string
	fcn?: () => void
}
function closeModal() {
	activeModals.pop()
	modalsDep.changed()
}
export function doModal(modalOptions: ModalOptions) {
	activeModals.push(modalOptions)
	modalsDep.changed()
}
