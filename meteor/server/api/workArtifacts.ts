import { ArtifactType, WorkArtifact, WorkArtifacts } from '../../lib/collections/WorkArtifact'
import fetch from 'node-fetch'
import { logger } from '../logging'
import { Env } from '../env'
import { WorkOrderId } from '../../lib/collections/WorkOrder'
import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'
import { protectString } from '../../lib/protectedString'
import { detectType, generateObjectToStore, isOutputPath } from './workArtifacts/utils'
import { getCurrentTime } from '../../lib/lib'

function onArtifact(workOrderId: WorkOrderId, output: string, name?: string, tags?: string[], type?: string) {
	const detectedType = detectType(output, type)
	const isPath = isOutputPath(output, detectedType)

	generateObjectToStore(workOrderId, detectedType, output, isPath)
		.then(
			Meteor.bindEnvironment((objectToStore: WorkArtifact['artifact']) => {
				WorkArtifacts.insert(<WorkArtifact>{
					_id: protectString(Random.id()),
					name,
					artifact: objectToStore,
					type: detectedType,
					workOrderId,
					tags: tags ?? [],
					created: getCurrentTime(),
				})
			})
		)
		.catch(
			Meteor.bindEnvironment((error) => {
				logger.error(`Could not insert artifact into WorkArtifacts: ${error}`)
			})
		)
}

const ARTIFACT_REGEX =
	/::set-output\s+(?:name=(?<name>.+?)::)?(?:tags=(?<tags>.+?)::)?(?:type=(?<type>.+?)::)?(?<output>[\s\S]+?)((?=\n\n)|(?=$)|(?=\n::set-output))/gim

export function catchArtifactsInOutput(workOrderId: WorkOrderId, data: string, workOrderTags: string[]) {
	if (data.indexOf('::set-output') === -1) {
		// check if the data even contains the set-output, so that we don't run the expensive RegEx on everything
		return
	}

	ARTIFACT_REGEX.lastIndex = 0
	let match: RegExpMatchArray | null = null
	do {
		match = ARTIFACT_REGEX.exec(data)
		if (match && match.groups) {
			const name = match.groups['name']
			const output = match.groups['output']
			const type = match.groups['type']
			const tags = match.groups['tags'] ? match.groups['tags'].split(/\s*,\s*/gi) : []
			if (!output) continue
			onArtifact(workOrderId, output, name, workOrderTags.concat(tags), type)
		}
	} while (match)
}

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
					logger.error(`Could not execute HTTP method on Work Artifact "${artifact.artifact.url}": ${error}`)
				})
		}
	},
})
