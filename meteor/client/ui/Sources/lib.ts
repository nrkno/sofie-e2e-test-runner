import { DockerImageSourceType, GitRepositorySourceType, Source } from '../../../lib/collections/Sources'

export function getSourceDescription(source: Source): string {
	switch (source.type) {
		case GitRepositorySourceType.Tests:
			return `Git: ${source.url}`
		case DockerImageSourceType.Blueprints:
		case DockerImageSourceType.Core:
			return [
				'Docker:',
				source.repo,
				source.registry ? `(${source.username ? source.username + '@' : ''}${source.registry})` : null,
			]
				.filter(Boolean)
				.join(' ')
	}
}
