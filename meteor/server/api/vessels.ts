import * as _ from 'underscore'
import { check } from 'meteor/check'
import { Random } from 'meteor/random'
import { MethodContextAPI } from '../../lib/api/methods'
import { VesselsAPI, VesselsAPIMethods } from '../../lib/api/vessels'
import { Vessel, VesselId, Vessels } from '../../lib/collections/Vessels'
import { registerClassToMeteorMethods } from '../methods'
import { protectString } from '../../lib/protectedString'
import { checkUserAccess } from '../security/methods'

class VesselsAPIClass extends MethodContextAPI implements VesselsAPI {
	addVessel(vesselSpec: Omit<Vessel, '_id'>): void {
		check(vesselSpec, Object)
		checkUserAccess(this)

		Vessels.insert({
			...vesselSpec,
			_id: protectString(Random.id()),
		})
	}
	changeVessel(vesselId: VesselId, vesselSpec: Partial<Omit<Vessel, '_id'>>): void {
		check(vesselId, String)
		check(vesselSpec, Object)
		checkUserAccess(this)

		Vessels.update(vesselId, {
			$set: _.omit(vesselSpec, ['_id']),
		})
	}
	removeVessel(vesselId: VesselId): void {
		check(vesselId, String)
		checkUserAccess(this)

		Vessels.remove(vesselId)
	}
}

registerClassToMeteorMethods(VesselsAPIMethods, VesselsAPIClass, false)
