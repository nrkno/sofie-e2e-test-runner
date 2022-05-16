import { registerIndex } from '../database'
import { Time } from '../lib'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'
import { createMongoCollection } from './lib'
import { WorkOrderId } from './WorkOrder'

export type WorkArtifactId = ProtectedString<'WorkArtifactId'>

export type Artifact = boolean

export enum ArtifactType {
	NumberArray = 'application/numbers-array+json',
	Boolean = 'application/boolean+json',
	PassFail = 'application/string+json',
	MochawesomeReport = 'application/mochawesome+json',
	CSV = 'text/csv',
	Image = 'image/png',
	Video = 'video/mp4',
	JSON = 'text/json',
	Binary = 'application/octet-stream',
}

interface WorkArtifactBase {
	_id: WorkArtifactId
	workOrderId: WorkOrderId
	name?: string
	tags: string[]
	type: ArtifactType
	artifact: any
	created: Time
}

export interface WorkArtifactNumberArray extends WorkArtifactBase {
	type: ArtifactType.NumberArray
	artifact: number[]
}

export interface WorkArtifactBoolean extends WorkArtifactBase {
	type: ArtifactType.Boolean
	artifact: boolean
}

export interface WorkArtifactPassFail extends WorkArtifactBase {
	type: ArtifactType.PassFail
	artifact: 'pass' | 'fail'
}

export interface WorkArtifactCSV extends WorkArtifactBase {
	type: ArtifactType.CSV
	artifact: string
}

export interface DocumentLinkArtifact {
	url: string
}

export interface WorkArtifactImage extends WorkArtifactBase {
	type: ArtifactType.Image
	artifact: DocumentLinkArtifact
}

export interface WorkArtifactVideo extends WorkArtifactBase {
	type: ArtifactType.Video
	artifact: DocumentLinkArtifact
}

export interface WorkArtifactBinary extends WorkArtifactBase {
	type: ArtifactType.Binary
	artifact: DocumentLinkArtifact
}

export interface WorkArtifactJSON extends WorkArtifactBase {
	type: ArtifactType.JSON
	artifact: object
}

export interface WorkArtifactMochawesome extends WorkArtifactBase {
	type: ArtifactType.MochawesomeReport
	artifact: object
}

export type WorkArtifact =
	| WorkArtifactNumberArray
	| WorkArtifactBoolean
	| WorkArtifactPassFail
	| WorkArtifactCSV
	| WorkArtifactImage
	| WorkArtifactVideo
	| WorkArtifactBinary
	| WorkArtifactJSON
	| WorkArtifactMochawesome

export const WorkArtifacts = createMongoCollection<WorkArtifact>(CollectionName.WorkArtifacts)
registerIndex(WorkArtifacts, {
	_id: 1,
})
