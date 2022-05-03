import React from 'react'
import { CContainer } from '@coreui/react'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../lib/pageTitle'
import { SourceList } from './SourceList'
import { Route, Routes } from 'react-router-dom'
import { SourceEdit } from './SourceEdit'

export const PAGE_TITLE = 'Sources'

export const Sources: React.FC = function Sources() {
	return (
		<>
			<Helmet>
				<title>{pageTitle(PAGE_TITLE)}</title>
			</Helmet>
			<CContainer xl className="my-xl-3">
				<h1 className="display-2">{PAGE_TITLE}</h1>
				<p className="lead">Manage sources for Docker images and Test Suite repositories.</p>
			</CContainer>
			<CContainer xl className="my-xl-3 py-3 bg-body border border-light rounded">
				<Routes>
					<Route path=":id" element={<SourceEdit />} />
					<Route path="new" element={<SourceEdit />} />
					<Route index element={<SourceList />} />
				</Routes>
			</CContainer>
		</>
	)
}
