import React from 'react'
import { Helmet } from 'react-helmet'
import { pageTitle } from '../lib/pageTitle'

export const PAGE_TITLE = 'Dashboard'

export const Dashboard: React.FC = function Dashboard() {
	return (
		<>
			<Helmet>
				<title>{pageTitle(PAGE_TITLE)}</title>
			</Helmet>
		</>
	)
}
