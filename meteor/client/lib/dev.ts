import { Collections } from '../../lib/lib'
import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import * as _ from 'underscore'
import { MeteorCall } from '../../lib/api/methods'

// Note: These things are convenience functions to be used during development:

Meteor.startup(() => {
	_.each(Collections, (val, key) => {
		window[key] = val
	})
})

window['Collections'] = Collections
window['Session'] = Session
window['MeteorCall'] = MeteorCall
