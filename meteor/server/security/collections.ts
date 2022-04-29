// import { rejectFields } from './lib/lib'
import { TestData } from '../../lib/collections/TestData'
import { WorkOrders } from '../../lib/collections/WorkOrder'

// Set up direct collection write access

TestData.allow({
	insert() {
		return true
	},
	update(_userId, _doc, _fields, _modifier) {
		return true
		// const access = allowAccessToCoreSystem({ userId: userId })
		// if (!access.update) return logNotAllowed('CoreSystem', access.reason)
		// return allowOnlyFields(doc, fields, ['support', 'systemInfo', 'name', 'apm', 'cron'])
	},
	remove() {
		return true
	},
})

WorkOrders.allow({
	insert() {
		return false
	},
	update() {
		return false
	},
	remove() {
		return false
	},
})
