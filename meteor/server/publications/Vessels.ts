import { Meteor } from 'meteor/meteor'

import { meteorPublish } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { check } from 'meteor/check'
import { Vessels } from '../../lib/collections/Vessels'

meteorPublish(PubSub.vessels, (selector, _token) => {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	check(selector, Object)

	return Vessels.find(selector, {
		fields: {
			privateKey: 0,
		},
	})
})
