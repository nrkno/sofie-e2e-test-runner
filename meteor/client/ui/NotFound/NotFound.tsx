import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { CContainer } from '@coreui/react'
import { pageTitle } from '../lib/pageTitle'

export const PAGE_TITLE = 'Not Found'

export const NotFound: React.FC = function NotFound() {
	return (
		<CContainer sm className="my-xl-5 text-center">
			<Helmet>
				<title>{pageTitle(PAGE_TITLE)}</title>
			</Helmet>
			<h1 className="display-2 my-xl-4 my-3">Not Found</h1>
			<img
				src="/img/undraw_not_found_-60-pq.svg"
				alt="Not Found"
				className="mx-auto d-block my-xl-5"
				style={{ width: '500px', maxWidth: '80vw' }}
			/>
			<p className="lead mt-xl-3 mt-2">We could not find this document.</p>
			<Link to="/">Go to dashboard</Link>
		</CContainer>
	)
}
