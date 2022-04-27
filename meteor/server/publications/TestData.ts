import { Meteor } from 'meteor/meteor'

import { meteorPublish } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { TestData } from '../../lib/collections/TestData'

meteorPublish(PubSub.testData, (selector, _token) => {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')

	return TestData.find(selector)
})
