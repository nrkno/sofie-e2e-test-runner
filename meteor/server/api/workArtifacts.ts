import { ArtifactType, WorkArtifacts } from '../../lib/collections/WorkArtifact'
import fetch from 'node-fetch'
import { logger } from '../logging'
import { Env } from '../env'

WorkArtifacts.find({}).observe({
	removed(artifact) {
		if (
			artifact.type === ArtifactType.Image ||
			artifact.type === ArtifactType.Video ||
			artifact.type === ArtifactType.Binary
		) {
			let headers: Record<string, string> | undefined = undefined

			const documentStorageHttpAuth = Env.DOCUMENT_STORAGE_AUTH
			if (documentStorageHttpAuth) {
				headers = {
					Authorization: documentStorageHttpAuth,
				}
			}

			logger.debug(
				`Deleting Work artifact document for Work Artifact: "${artifact._id}": "${artifact.artifact.url}"`
			)

			fetch(artifact.artifact.url, {
				method: 'DELETE',
				headers,
			})
				.then((response) => {
					if (!response.ok) {
						logger.error(
							`Could not delete Work Artifact document: "${artifact.artifact.url}": ${response.status} "${response.body}"`
						)
					} else if (response.status === 404) {
						logger.debug(`Work Artifact document already gone: "${artifact.artifact.url}"`)
					} else {
						logger.debug(`Successfully deleted Work Artifact document: "${artifact.artifact.url}"`)
					}
				})
				.catch((error) => {
					logger.error(`Could execute HTTP method on Work Artifact "${artifact.artifact.url}": ${error}`)
				})
		}
	},
})
