import { registerCollection, ProtectedString } from '../lib'
import { createMongoCollection } from './lib'
import { registerIndex } from '../database'

export type TestDataId = ProtectedString<'TestDataId'>

export interface TestDataObject {
	_id: TestDataId
	name: string
}

export const TestData = createMongoCollection<TestDataObject, TestDataObject>('TestData')
registerCollection('TestData', TestData)
registerIndex(TestData, {
	_id: 1,
})
