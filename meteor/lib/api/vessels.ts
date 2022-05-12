import { Vessel, VesselId } from '../collections/Vessels'

export interface VesselsAPI {
	addVessel(vesselSpec: Omit<Vessel, '_id'>): VesselId
	changeVessel(vesselId: VesselId, vesselSpec: Partial<Omit<Vessel, '_id'>>): void
	removeVessel(vesselId: VesselId): void
}

export enum VesselsAPIMethods {
	'addVessel' = 'vessels.addVessel',
	'changeVessel' = 'vessels.changeVessel',
	'removeVessel' = 'vessels.removeVessel',
}
