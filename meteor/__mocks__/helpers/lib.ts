import * as _ from 'underscore'
import { AsyncMongoCollection } from '../../lib/collections/lib'
import { ProtectedString } from '../../lib/protectedString'

/*
interface MockedCollection<T, Y extends any[]> {
	mockClear: jest.MockInstance<T, Y>['mockClear']
	mockReset: jest.MockInstance<T, Y>['mockReset']
}
*/
interface MockedCollection {
	mockClear: () => void
	mockReset: () => void
}
const METHOD_NAMES = [
	'allow',
	'deny',
	'find',
	'findOne',
	'insert',
	'rawCollection',
	'rawDatabase',
	'remove',
	'update',
	'upsert',
	'_ensureIndex',
	'_dropIndex',
	'findFetchAsync',
	'findOneAsync',
	'insertAsync',
	'insertManyAsync',
	'insertIgnoreAsync',
	'updateAsync',
	'upsertAsync',
	'removeAsync',
	'bulkWriteAsync',
]

/**
 * Make mocks of all methods of a collection.
 * Important: This Remember to run resetMockupCollection() after the test
 */
export function mockupCollection<A extends { _id: ProtectedString<any> }>(
	collection0: AsyncMongoCollection<A>
): AsyncMongoCollection<A> & MockedCollection {
	const collection = collection0 as AsyncMongoCollection<A> & MockedCollection

	_.each(METHOD_NAMES, (methodName) => {
		collection['__original' + methodName] = collection[methodName]
		collection[methodName] = jest.fn(collection[methodName])
	})

	collection.mockClear = () => {
		_.each(METHOD_NAMES, (methodName) => collection[methodName].mockClear())
	}
	collection.mockReset = () => {
		_.each(METHOD_NAMES, (methodName) => collection[methodName].mockReset())
	}

	return collection
}
export function resetMockupCollection<A extends { _id: ProtectedString<any> }>(
	collection: AsyncMongoCollection<A>
): void {
	_.each(METHOD_NAMES, (methodName) => {
		collection[methodName] = collection['__original' + methodName]
		delete collection['__original' + methodName]
	})
}
