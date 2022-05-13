// import { rejectFields } from './lib/lib'
import { Sources } from '../../lib/collections/Sources'
import { TestData } from '../../lib/collections/TestData'
import { Vessels } from '../../lib/collections/Vessels'
import { WorkArtifacts } from '../../lib/collections/WorkArtifact'
import { WorkOrders } from '../../lib/collections/WorkOrder'
import { WorkOrderOutputs } from '../../lib/collections/WorkOrderOutput'

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

const denyAllModifications = {
	insert() {
		return false
	},
	update() {
		return false
	},
	remove() {
		return false
	},
}

WorkOrders.allow(denyAllModifications)
Sources.allow(denyAllModifications)
Vessels.allow(denyAllModifications)
WorkOrderOutputs.allow(denyAllModifications)
WorkArtifacts.allow(denyAllModifications)
