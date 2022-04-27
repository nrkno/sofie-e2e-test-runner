import * as React from 'react'
import 'moment/min/locales'
import { doModal, ModalContainer } from '../lib/modal'
import { CButton, CContainer, CFooter, CLink, CNavbar, CNavbarBrand } from '@coreui/react'

/*
	CoreUI Docs:
	React components: https://coreui.io/react/docs/getting-started/introduction/
	CSS: https://coreui.io/docs/getting-started/introduction/
*/

export const App: React.FC<{}> = function App() {
	return (
		<>
			<CNavbar colorScheme="dark" className="bg-dark">
				<CContainer fluid>
					<CNavbarBrand>Hello world!</CNavbarBrand>
				</CContainer>
			</CNavbar>
			<CContainer xl className="my-5">
				<div>Hello world!</div>
				<CButton
					onClick={() => {
						doModal({
							content: 'This is a modal dialog',
							title: 'Some title',
							actions: [
								{
									label: 'OK',
								},
							],
						})
					}}
				>
					Test
				</CButton>
			</CContainer>
			<CFooter>
				<div>
					<CLink href="#">Hello world!</CLink>
					<span> &copy; 2022 SomeCompany</span>
				</div>
				<div>
					<span>Powered by </span>
					<CLink href="https://www.meteor.com/">Meteor</CLink>
				</div>
			</CFooter>
			<ModalContainer />
		</>
	)
}
