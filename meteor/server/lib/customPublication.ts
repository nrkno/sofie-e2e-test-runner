import { Meteor } from 'meteor/meteor'
import { PubSub } from '../../lib/api/pubsub'
import { DBObj, unprotectString } from '../../lib/lib'
import _ from 'underscore'

class CustomPublish {
	private _onStop: () => void
	constructor(private _meteorPublication: any, private _collectionName: string) {
		this._meteorPublication.onStop(() => {
			if (this._onStop) this._onStop()
		})
	}
	onStop(callback: () => void) {
		this._onStop = callback
	}
	/** Indicate to the client that the initial document(s) have been sent */
	ready() {
		this._meteorPublication.ready()
	}
	/** Added document */
	added(_id: string, document: any) {
		this._meteorPublication.added(this._collectionName, _id, document)
	}
	/** Changed document */
	changed(_id: string, doc: any) {
		this._meteorPublication.changed(this._collectionName, _id, doc)
	}
	/** Removed document */
	removed(_id: string) {
		this._meteorPublication.removed(this._collectionName, _id)
	}
}

function genericMeteorCustomPublish(
	publicationName: string,
	customCollectionName: string,
	cb: (publication: CustomPublish, ...args: any[]) => void
) {
	Meteor.publish(publicationName, function (...args: any[]) {
		cb(new CustomPublish(this, customCollectionName), ...args)
	})
}

/** Wrapping of Meteor.publish to provide types for for custom publications */
export function meteorCustomPublish(
	publicationName: PubSub,
	customCollectionName: string,
	cb: (publication: CustomPublish, ...args: any[]) => void
): void {
	genericMeteorCustomPublish(publicationName, customCollectionName, cb)
}

class CustomPublishArray {
	private _docs: { [id: string]: DBObj } = {}
	private _firstRun: boolean = true
	constructor(private _publication: CustomPublish) {}
	onStop(callback: () => void) {
		this._publication.onStop(callback)
	}
	updatedDocs(newDocs: DBObj[]) {
		const newIds: { [id: string]: true } = {}
		// figure out which documents have changed

		const oldIds = Object.keys(this._docs)

		for (const newDoc of newDocs) {
			const id = unprotectString(newDoc._id)
			if (newIds[id]) {
				throw new Meteor.Error(`Error in custom publication: _id "${id}" is not unique!`)
			}
			newIds[id] = true
			if (!this._docs[id]) {
				// added
				this._docs[id] = _.clone(newDoc)

				this._publication.added(id, newDoc)
			} else if (!_.isEqual(this._docs[id], newDoc)) {
				// changed

				this._publication.changed(id, newDoc)
				this._docs[id] = _.clone(newDoc)
			}
		}

		for (const id of oldIds) {
			if (!newIds[id]) {
				// Removed
				delete this._docs[id]
				this._publication.removed(id)
			}
		}

		if (this._firstRun) {
			this._publication.ready()
			this._firstRun = false
		}
	}
}

/** Convenience function for making custom publications of array-data */
export function meteorCustomPublishArray(
	publicationName: PubSub,
	customCollectionName: string,
	cb: (publication: CustomPublishArray, ...args: any[]) => void
): void {
	genericMeteorCustomPublish(publicationName, customCollectionName, (pub, ...args) => {
		cb(new CustomPublishArray(pub), ...args)
	})
}
