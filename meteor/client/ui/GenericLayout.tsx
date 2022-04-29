import { CFooter, CLink } from '@coreui/react'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { APP_COPYRIGHT, APP_GITHUB_LINK, APP_NAME } from '../../lib/constants'
import { Navbar } from './Navbar/Navbar'

export const GenericLayout: React.FC = function GenericLayout() {
	return (
		<>
			<Navbar />
			{/* <CContainer xl className="my-xl-5 py-3 bg-body border border-light rounded">
				<div>{APP_NAME}</div>
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
			</CContainer> */}
			<Outlet />
			<CFooter>
				<div>
					<CLink href={APP_GITHUB_LINK}>{APP_NAME}</CLink>
					<span> &copy; {APP_COPYRIGHT}</span>
				</div>
			</CFooter>
		</>
	)
}
