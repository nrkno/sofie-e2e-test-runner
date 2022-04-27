import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'

export type TestDataId = ProtectedString<'TestDataId'>

export interface TestDataObject {
	_id: TestDataId
	name: string
}

export const TestData = createMongoCollection<TestDataObject>(CollectionName.TestData)
registerIndex(TestData, {
	_id: 1,
})
