import React from 'react'
import 'moment/min/locales'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ModalContainer } from '../lib/modal'
import { Dashboard } from './Dashboard/Dashboard'
import { History } from './History/History'
import { GenericLayout } from './GenericLayout'
import { NotFound } from './NotFound/NotFound'

/*
	CoreUI Docs:
	React components: https://coreui.io/react/docs/getting-started/introduction/
	CSS: https://coreui.io/docs/getting-started/introduction/
*/

export const App: React.FC = function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<GenericLayout />}>
						<Route index element={<Dashboard />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="history" element={<History />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
			<ModalContainer />
		</>
	)
}
