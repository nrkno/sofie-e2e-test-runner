import { Meteor } from 'meteor/meteor'

import { meteorPublish } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { check } from 'meteor/check'
import { WorkOrders } from '../../lib/collections/WorkOrder'

meteorPublish(PubSub.workOrders, (selector, _token) => {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	check(selector, Object)

	return WorkOrders.find(selector, {})
})
