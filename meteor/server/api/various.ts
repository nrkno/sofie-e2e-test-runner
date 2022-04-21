import { registerClassToMeteorMethods } from '../methods'
import { MethodContextAPI } from '../../lib/api/methods'
import { VariousAPI, VariousAPIMethods } from '../../lib/api/various'
import { TestData } from '../../lib/collections/TestData'
import { getRandomId } from '../../lib/lib'

class VariousAPIClass extends MethodContextAPI implements VariousAPI {
	async addTestData(name: string) {
		TestData.insert({
			_id: getRandomId(),
			name: name,
		})
	}
}

registerClassToMeteorMethods(VariousAPIMethods, VariousAPIClass, false)
