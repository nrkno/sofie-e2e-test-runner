import React from 'react'
import { CContainer } from '@coreui/react'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../lib/pageTitle'
import { VesselList } from './VesselList'
import { Route, Routes } from 'react-router-dom'
import { VesselEdit } from './VesselEdit'

export const PAGE_TITLE = 'Vessels'

export const Vessels: React.FC = function Vessels() {
	return (
		<>
			<Helmet>
				<title>{pageTitle(PAGE_TITLE)}</title>
			</Helmet>
			<CContainer xl className="my-xl-3">
				<h1 className="display-2">{PAGE_TITLE}</h1>
				<p className="lead">Manage hosts for Docker Images to be run on.</p>
			</CContainer>
			<CContainer xl className="my-xl-3 py-3 bg-body border border-light rounded">
				<Routes>
					<Route path=":id" element={<VesselEdit />} />
					<Route path="new" element={<VesselEdit />} />
					<Route index element={<VesselList />} />
				</Routes>
			</CContainer>
		</>
	)
}
