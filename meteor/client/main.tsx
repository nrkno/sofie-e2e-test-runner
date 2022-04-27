import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createRoot } from 'react-dom/client'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import '../lib/main'

// Import files that call Meteor.startup:
import './lib/dev'

import { App } from './ui/App'

// if ('serviceWorker' in navigator) {
// 	// Use the window load event to keep the page load performant
// 	window.addEventListener('load', () => {
// 		// in some versions of Chrome, registering the Service Worker over HTTP throws an arror
// 		if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
// 			navigator.serviceWorker.register('/sw.js').catch((err) => {
// 				console.error(err)
// 			})
// 		}
// 	})
// }

Meteor.startup(() => {
	const container = document.getElementById('render-target')
	if (!container) throw new Error('Could not find container for React App')
	const root = createRoot(container)
	root.render(
		<DndProvider backend={HTML5Backend}>
			<App />
		</DndProvider>
	)
})
