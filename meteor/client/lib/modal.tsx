import * as React from 'react'
import { Tracker } from 'meteor/tracker'
import { useTracker } from './ReactMeteorData/ReactMeteorData'
import Modal from 'react-bootstrap/Modal'
import classNames from 'classnames'

const modalsDep = new Tracker.Dependency()
const activeModals: ModalOptions[] = []

export const ModalContainer: React.FC<{}> = function ModalContainer(props) {
	const latestModal: ModalOptions | undefined = useTracker(() => {
		modalsDep.depend()
		return activeModals[activeModals.length - 1]
	}, [])

	if (!latestModal) return null
	return (
		<div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
			<Modal.Dialog>
				<Modal.Header>
					<button
						type="button"
						className="btn-close float-right"
						aria-label="Close"
						onClick={() => closeModal()}
					></button>
					<Modal.Title>{latestModal.title}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<p>{latestModal.content}</p>
				</Modal.Body>

				<Modal.Footer>
					{latestModal.actions.map((action, index) => {
						return (
							<button
								key={index}
								type="button"
								className={classNames('btn', index === 0 ? 'btn-primary' : 'btn-default')}
								onClick={() => {
									action.fcn?.()
									closeModal()
								}}
							>
								{action.label}
							</button>
						)
					})}
				</Modal.Footer>
			</Modal.Dialog>
		</div>
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
