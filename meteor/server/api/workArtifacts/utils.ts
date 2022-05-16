import path from 'path'
import fs from 'fs'
import { ArtifactType, WorkArtifact } from '../../../lib/collections/WorkArtifact'
import { WorkOrderId } from '../../../lib/collections/WorkOrder'
import { assertNever } from '../../../lib/lib'
import fetch from 'node-fetch'
import { Env } from '../../env'
import { Random } from 'meteor/random'
import { logger } from '../../logging'
import { Meteor } from 'meteor/meteor'

export function detectType(output: string, type?: string): ArtifactType {
	switch (type) {
		case 'numbers':
		case ArtifactType.NumberArray:
			return ArtifactType.NumberArray
		case 'passfail':
		case 'testpass':
		case 'pass':
		case 'fail':
		case ArtifactType.PassFail:
			return ArtifactType.PassFail
		case 'boolean':
		case ArtifactType.Boolean:
			return ArtifactType.Boolean
		case 'csv':
		case ArtifactType.CSV:
			return ArtifactType.CSV
		case 'json':
		case ArtifactType.JSON:
			return ArtifactType.JSON
		case 'mochawesome':
			return ArtifactType.MochawesomeReport
		case 'image':
		case ArtifactType.Image:
			return ArtifactType.Image
		case 'video':
		case ArtifactType.Video:
			return ArtifactType.Video
		case 'binary':
		case 'data':
		case 'blob':
			return ArtifactType.Binary
	}

	if (output === 'pass' || output === 'fail') {
		return ArtifactType.PassFail
	}

	// TODO: Detect artifact type based on output
	try {
		const data = JSON.parse(output)
		if (typeof data === 'boolean') {
			return ArtifactType.Boolean
		} else if (typeof data === 'object' && Array.isArray(data)) {
			return ArtifactType.NumberArray
		} else if (typeof data === 'object') {
			return ArtifactType.JSON
		}
	} catch (e) {
		// empty catch, JSON.parse can throw and it's not an error, just means it's not a JSON
	}

	if (output.substring(output.length - 4).toLowerCase() === '.png') {
		return ArtifactType.Image
	} else if (output.substring(output.length - 4).toLowerCase() === '.csv') {
		return ArtifactType.CSV
	} else if (output.substring(output.length - 4).toLowerCase() === '.mp4') {
		return ArtifactType.Video
	}

	return ArtifactType.Binary
}

export function isOutputPath(output: string, type: ArtifactType): boolean {
	switch (type) {
		case ArtifactType.NumberArray:
		case ArtifactType.PassFail:
		case ArtifactType.Boolean:
			return false
		case ArtifactType.MochawesomeReport:
		case ArtifactType.Image:
		case ArtifactType.Video:
		case ArtifactType.Binary:
		case ArtifactType.CSV: {
			const parsedPath = path.parse(output)
			if (parsedPath.name) {
				const cwdPath = path.join(Env.EXECUTOR_CWD, output)
				return fs.existsSync(cwdPath)
			}
			return false
		}
		case ArtifactType.JSON: {
			if (output[0] === '{') {
				return false
			}
			const parsedPath = path.parse(output)
			if (parsedPath.name) {
				const cwdPath = path.join(Env.EXECUTOR_CWD, output)
				return fs.existsSync(cwdPath)
			}
			return false
		}
		default:
			assertNever(type)
	}
	return false
}

function isLinkArtifact(type: ArtifactType) {
	if (type === ArtifactType.Binary || type === ArtifactType.Image || type === ArtifactType.Video) {
		return true
	}

	return false
}

function makeArtifactUrl(workOrderId: WorkOrderId, fileName: string): string {
	const url = `${Env.DOCUMENT_STORAGE_URL}/${workOrderId}/${Random.id()}-${fileName}`
	return url
}

export async function generateObjectToStore(
	workOrderId: WorkOrderId,
	type: ArtifactType,
	output: string,
	isPath: boolean
): Promise<WorkArtifact['artifact']> {
	if (isPath) {
		const parsedPath = path.parse(output)

		if (!isLinkArtifact(type)) {
			const cwdPath = path.join(Env.EXECUTOR_CWD, output)
			const data = await fs.promises.readFile(cwdPath, {
				encoding: 'utf8',
			})

			if (type === ArtifactType.JSON || type === ArtifactType.MochawesomeReport) {
				return JSON.parse(data)
			}

			return data
		} else {
			const headers: Record<string, string> | undefined = {
				'content-type': type,
			}

			const documentStorageHttpAuth = Env.DOCUMENT_STORAGE_AUTH
			if (documentStorageHttpAuth) {
				headers['authorization'] = documentStorageHttpAuth
			}

			const artifactUrl = makeArtifactUrl(workOrderId, parsedPath.name + parsedPath.ext)

			try {
				const cwdPath = path.join(Env.EXECUTOR_CWD, output)
				const response = await fetch(artifactUrl, {
					method: 'PUT',
					headers,
					body: fs.createReadStream(cwdPath),
				})

				if (!response.ok) {
					throw new Meteor.Error(
						501,
						`Could not upload Work Artifact document: "${artifactUrl}": ${response.status} "${response.body}"`
					)
				} else {
					logger.debug(`Successfully uploaded Work Artifact document: "${artifactUrl}"`)
				}

				return {
					url: artifactUrl,
				}
			} catch (error) {
				logger.error(`Could not execute HTTP method on Work Artifact "${artifactUrl}": ${error}`)
				throw error
			}
		}
	} else {
		if (
			type === ArtifactType.JSON ||
			type === ArtifactType.MochawesomeReport ||
			type === ArtifactType.Boolean ||
			type === ArtifactType.NumberArray
		) {
			return JSON.parse(output)
		}

		return output
	}
}
