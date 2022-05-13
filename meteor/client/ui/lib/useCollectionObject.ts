import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import React, { useState, useEffect } from 'react'
import { AsyncMongoCollection } from '../../../lib/collections/lib'
import { literal } from '../../../lib/lib'
import { ProtectedString } from '../../../lib/protectedString'
import { FindOptions, MongoSelector } from '../../../lib/typings/meteor'

export function useOneCollectionObject<DBInterface extends { _id: ProtectedString<any> }>(
	collection: AsyncMongoCollection<DBInterface>,
	selector: MongoSelector<DBInterface> | Mongo.ObjectID | DBInterface['_id'] | undefined,
	options: Omit<FindOptions<DBInterface>, 'limit'>,
	initial: DBInterface,
	ready: boolean
): [DBInterface, React.Dispatch<React.SetStateAction<DBInterface>>]
export function useOneCollectionObject<DBInterface extends { _id: ProtectedString<any> }>(
	collection: AsyncMongoCollection<DBInterface>,
	selector: MongoSelector<DBInterface> | Mongo.ObjectID | DBInterface['_id'] | undefined,
	options: Omit<FindOptions<DBInterface>, 'limit'>,
	initial: DBInterface | undefined,
	ready: boolean
): [DBInterface | undefined, React.Dispatch<React.SetStateAction<DBInterface | undefined>>] {
	const [baseObj, setBaseObj] = useState<DBInterface | undefined>(literal<DBInterface | undefined>(initial))
	useEffect(() => {
		if (ready && selector) {
			Tracker.nonreactive(() => {
				const source = collection.findOne(selector, options)
				if (source) {
					setBaseObj(source)
				}
			})
		}
	}, [ready, selector])

	return [baseObj, setBaseObj]
}
