import { Meteor } from 'meteor/meteor'

import { meteorPublish } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { check } from 'meteor/check'
import { WorkOrderOutputs } from '../../lib/collections/WorkOrderOutput'

meteorPublish(PubSub.workOrderOutputs, (selector, _token) => {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	check(selector, Object)

	return WorkOrderOutputs.find(selector, {})
})
