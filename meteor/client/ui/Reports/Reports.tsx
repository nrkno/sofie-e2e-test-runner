import React from 'react'
import { CContainer } from '@coreui/react'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../lib/pageTitle'

export const PAGE_TITLE = 'Reports'

export const Reports: React.FC = function Reports() {
	return (
		<>
			<Helmet>
				<title>{pageTitle(PAGE_TITLE)}</title>
			</Helmet>
			<CContainer xl className="my-xl-3">
				<h1 className="display-2">{PAGE_TITLE}</h1>
				<p className="lead">Inspect the test runs and browse test run artifacts.</p>
			</CContainer>
			<CContainer xl className="my-xl-3 py-3 bg-body border border-light rounded"></CContainer>
		</>
	)
}
