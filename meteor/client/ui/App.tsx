import * as React from 'react'
import 'moment/min/locales'
import { ModalContainer } from '../lib/modal'

export const App: React.FC<{}> = function App(props: {}) {
	return (
		<>
			<div>Hello world!</div>
			<ModalContainer />
		</>
	)
}
