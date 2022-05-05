import { Meteor } from 'meteor/meteor'

export enum PubSub {
	testData = 'testData',
	sources = 'sources',
	vessels = 'vessels',
}

export function meteorSubscribe(name: PubSub, ...args: any[]): Meteor.SubscriptionHandle {
	if (Meteor.isClient) {
		return Meteor.subscribe(name, ...args)
	} else throw new Meteor.Error(500, 'meteorSubscribe is only available client-side')
}
