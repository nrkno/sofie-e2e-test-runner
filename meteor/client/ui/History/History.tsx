import { CContainer } from '@coreui/react'
import React from 'react'

export const History: React.FC = function History() {
	return (
		<>
			<CContainer xl className="my-xl-3">
				<h1 className="display-2">History</h1>
				<p className="lead">Inspect the test runs and browse test run artifacts.</p>
			</CContainer>
			<CContainer xl className="my-xl-3 py-3 bg-body border border-light rounded"></CContainer>
		</>
	)
}
