import React from 'react'
import 'moment/min/locales'
import { Helmet } from 'react-helmet'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ModalContainer } from '../lib/modal'
import { Dashboard } from './Dashboard/Dashboard'
import { Reports } from './Reports/Reports'
import { GenericLayout } from './GenericLayout'
import { NotFound } from './NotFound/NotFound'
import { APP_NAME } from '../../lib/constants'
import { Sources } from './Sources/Sources'

/*
	CoreUI Docs:
	React components: https://coreui.io/react/docs/getting-started/introduction/
	CSS: https://coreui.io/docs/getting-started/introduction/
*/

export const App: React.FC = function App() {
	return (
		<>
			<Helmet>
				<title>{APP_NAME}</title>
			</Helmet>
			<Router>
				<Routes>
					<Route path="/" element={<GenericLayout />}>
						<Route index element={<Dashboard />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="reports" element={<Reports />} />
						<Route path="sources" element={<Sources />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
			<ModalContainer />
		</>
	)
}
