import { DockerRegistrySource, GitRepositorySource, SourceId } from '../collections/Sources'

export interface SourcesAPI {
	addGitSource(sourceSpec: Omit<GitRepositorySource, '_id' | 'refs'>): void
	addDockerSource(sourceSpec: Omit<DockerRegistrySource, '_id' | 'refs'>): void
	removeSource(sourceId: SourceId): void
}

export enum SourcesAPIMethods {
	'addGitSource' = 'sources.addGitSource',
	'addDockerSource' = 'sources.addDockerSource',
	'removeSource' = 'sources.removeSource',
}
