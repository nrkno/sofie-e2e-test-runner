import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { ProtectedString } from '../protectedString'
import { CollectionName } from './Collections'

export type GitRepositorySourceId = ProtectedString<'GitRepositorySourceId'>
export type DockerRegistrySourceId = ProtectedString<'DockerRepositorySourceId'>

export type SourceId = GitRepositorySourceId | DockerRegistrySourceId

export enum DockerImageSourceType {
	Core = 'core',
	Blueprints = 'blueprints',
}

export enum GitRepositorySourceType {
	Tests = 'tests',
}

export type Source = GitRepositorySource | DockerRegistrySource

interface SourceBase {
	/** Name of the Source */
	name: string
	/** Should this source be scanned? */
	enabled?: boolean
	/** User-defined tags for grouping and searching */
	tags: string[]
	/** Images, tags, branches available on this Source */
	refs: string[]
	/** Last update timestamp */
	updated?: number
}

/**
 * A description of a Git Repository to be scanned for tags/branches
 *
 * @export
 * @interface GitRepositorySource
 */
export interface GitRepositorySource extends SourceBase {
	_id: GitRepositorySourceId
	/** Type of the Source */
	type: GitRepositorySourceType
	/** SSH key, can only be read on the Server, is never published to the client */
	privateKey?: string
	/** Is there an SSH key set? */
	privateKeySet?: boolean
	/** Git URL: can be HTTPS for SSH (git@github.com:nrkno/...) */
	url: string
}

/**
 * A Docker Registry to be scanned for images
 *
 * @export
 * @interface DockerRegistrySource
 */
export interface DockerRegistrySource extends SourceBase {
	_id: DockerRegistrySourceId
	/** Type of the Source */
	type: DockerImageSourceType
	/** Name of the repository in the Registry (with namespace) */
	repo: string
	/** Registry URL. If not specified, docker.io will be assumed */
	registry?: string
	/** Username for Basic HTTP Auth */
	username?: string
	/** Password for Basic HTTP Auth, can only be read on the Server */
	password?: string
	/** Is a password set? */
	passwordSet?: boolean
}

export const Sources = createMongoCollection<Source>(CollectionName.Sources)
registerIndex(Sources, {
	_id: 1,
})
