import { Meteor } from 'meteor/meteor'
import * as _ from 'underscore'
import { PubSub } from '../../lib/api/pubsub'
import { extractFunctionSignature } from '../lib'
import { Mongocursor, UserId } from '../../lib/typings/meteor'
import { ProtectedString } from '../../lib/protectedString'

export const MeteorPublicationSignatures: { [key: string]: string[] } = {}
export const MeteorPublications: { [key: string]: Function } = {}

/**
 * Wrapper around Meteor.publish with stricter typings
 * @param name
 * @param callback
 */
export function meteorPublish<T extends { _id: ProtectedString<any> }>(
	name: PubSub,
	callback: (...args: any[]) => Mongocursor<T> | Mongocursor<T>[] | null
) {
	const signature = extractFunctionSignature(callback)
	if (signature) MeteorPublicationSignatures[name] = signature

	MeteorPublications[name] = callback

	Meteor.publish(name, function (...args: any[]) {
		return callback.apply(this, args) || []
	})
}
