import {
	DockerRegistrySource,
	DockerRegistrySourceId,
	GitRepositorySource,
	GitRepositorySourceId,
	SourceId,
} from '../collections/Sources'

export interface SourcesAPI {
	addGitSource(sourceSpec: Omit<GitRepositorySource, '_id' | 'refs'>): GitRepositorySourceId
	addDockerSource(sourceSpec: Omit<DockerRegistrySource, '_id' | 'refs'>): DockerRegistrySourceId
	changeGitSource(
		sourceId: GitRepositorySourceId,
		sourceSpec: Partial<Omit<GitRepositorySource, '_id' | 'refs'>>
	): void
	changeDockerSource(
		sourceId: DockerRegistrySourceId,
		sourceSpec: Partial<Omit<DockerRegistrySource, '_id' | 'refs'>>
	): void
	removeSource(sourceId: SourceId): void
}

export enum SourcesAPIMethods {
	'addGitSource' = 'sources.addGitSource',
	'addDockerSource' = 'sources.addDockerSource',
	'changeGitSource' = 'sources.changeGitSource',
	'changeDockerSource' = 'sources.changeDockerSource',
	'removeSource' = 'sources.removeSource',
}
