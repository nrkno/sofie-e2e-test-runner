import { Meteor } from 'meteor/meteor'

import { meteorPublish } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { check } from 'meteor/check'
import { Sources } from '../../lib/collections/Sources'

meteorPublish(PubSub.sources, (selector, _token) => {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	check(selector, Object)

	return Sources.find(selector, {
		fields: {
			password: 0,
			sshKey: 0,
		},
	})
})
