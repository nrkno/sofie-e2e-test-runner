import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'

export type GitRepositorySourceId = ProtectedString<'GitRepositorySourceId'>
export type DockerRegistrySourceId = ProtectedString<'DockerRepositorySourceId'>

export type VesselId = ProtectedString<'VesselId'>

export interface Vessel {
	_id: VesselId
	host: string
	username: string
	tags: string[]
	privateKey?: string
	privateKeySet: boolean
	remoteDirectory: string
}

export const Vessels = createMongoCollection<Vessel>(CollectionName.Vessels)
registerIndex(Vessels, {
	_id: 1,
})
