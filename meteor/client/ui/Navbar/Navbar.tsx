import React, { useState } from 'react'
import {
	CButton,
	CCollapse,
	CContainer,
	CForm,
	CFormInput,
	CInputGroup,
	CNavbar,
	CNavbarBrand,
	CNavbarNav,
	CNavbarToggler,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { APP_NAME } from '../../../lib/constants'
import { NavLink } from './NavLink'

export const Navbar: React.FC = function Navbar() {
	const [visible, setVisible] = useState(false)

	return (
		<CNavbar expand="lg" colorScheme="dark" className="bg-dark">
			<CContainer fluid>
				<CNavbarBrand>{APP_NAME}</CNavbarBrand>
				<CNavbarToggler onClick={() => setVisible(!visible)} />
				<CCollapse className="navbar-collapse clearfix" visible={visible}>
					<CNavbarNav className="me-auto mb-2 mb-lg-0">
						<NavLink to="/">Dashboard</NavLink>
						<NavLink to="/schedule">Schedule</NavLink>
						<NavLink to="/history">History</NavLink>
						<NavLink to="/sources">Sources</NavLink>
						<NavLink to="/vessels">Vessels</NavLink>
					</CNavbarNav>
					<CForm className="d-flex">
						<CInputGroup>
							<CFormInput type="search" placeholder="Search" />
							<CButton type="submit" color="secondary" variant="outline">
								Search
							</CButton>
						</CInputGroup>
					</CForm>
					<CNavbarNav className="mb-2 mb-lg-0">
						<NavLink to="/settings" className="d-none d-lg-inline-block ms-3">
							<FontAwesomeIcon icon={faCog} />
						</NavLink>
						<NavLink to="/settings" className="d-lg-none">
							Settings
						</NavLink>
					</CNavbarNav>
				</CCollapse>
			</CContainer>
		</CNavbar>
	)
}
