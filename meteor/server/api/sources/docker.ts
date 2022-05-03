import dockerRegistry from '@snyk/docker-registry-v2-client'
import { SourceId } from '../../../lib/collections/Sources'

export async function scanRegistry(
	_sourceId: SourceId,
	repo: string,
	registry: string = 'registry-1.docker.io',
	username?: string,
	password?: string
): Promise<string[]> {
	return dockerRegistry.getTags(registry, repo, username, password)
}
