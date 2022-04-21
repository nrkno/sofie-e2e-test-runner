import { rejectFields } from './lib/lib'

import { TestData } from '../../lib/collections/TestData'

// Set up direct collection write access

TestData.allow({
	insert() {
		return true
	},
	update(userId, doc, fields, _modifier) {
		return true
		// const access = allowAccessToCoreSystem({ userId: userId })
		// if (!access.update) return logNotAllowed('CoreSystem', access.reason)
		// return allowOnlyFields(doc, fields, ['support', 'systemInfo', 'name', 'apm', 'cron'])
	},
	remove() {
		return true
	},
})
