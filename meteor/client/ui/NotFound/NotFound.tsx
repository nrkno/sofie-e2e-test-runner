import React from 'react'
import { Link } from 'react-router-dom'
import { CContainer } from '@coreui/react'

export const NotFound: React.FC = function NotFound() {
	return (
		<CContainer sm className="my-xl-5 text-center">
			<h1 className="display-2 my-xl-3">Not Found</h1>
			<img
				src="/img/undraw_not_found_-60-pq.svg"
				alt="Not Found"
				className="mx-auto d-block my-xl-5"
				style={{ maxWidth: '500px' }}
			/>
			<p className="lead mt-xl-3">We could not find this document.</p>
			<Link to="/">Go to dashboard</Link>
		</CContainer>
	)
}
