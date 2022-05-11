import { IncomingMessage, ServerResponse } from 'http'
import { PickerDELETE, PickerGET, PickerPUT } from './http'
import fs from 'fs'
import path from 'path'
import { logger } from '../logging'
import { Env } from '../env'

const documentStorageHttpAuth = Env.DOCUMENT_STORAGE_AUTH
const documentStoragePath = Env.DOCUMENT_STORAGE_PATH

function checkAuthorized(req: IncomingMessage): boolean {
	// Allways allow loopback connections, this is the system talking to itself
	if (req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1') {
		return true
		// Check if the authorization matches what we expect
	} else if (
		req.headers.authorization !== undefined &&
		req.headers.authorization.trim() !== '' &&
		req.headers.authorization === documentStorageHttpAuth
	) {
		return true
	}
	return false
}

function respondStatus(res: ServerResponse, status: number, body?: string) {
	res.statusCode = status
	res.end(body)
}

PickerPUT.route('/documents/:workOrderId/:fileName', (params, req, res) => {
	if (!checkAuthorized(req)) {
		respondStatus(res, 401, 'Unauthorized')
		return
	}

	const workOrderId = params['workOrderId']
	if (!workOrderId) {
		respondStatus(res, 400, 'Work Order Id missing')
		return
	}
	const fileName = params['fileName']
	if (!fileName) {
		respondStatus(res, 400, 'File Name missing')
		return
	}

	const filePath = path.join(documentStoragePath, `${workOrderId}-${fileName}`)

	fs.writeFile(filePath, req.body, (err) => {
		if (err) {
			logger.error(`Could not write file "${filePath}": ${err}`)
			respondStatus(res, 500)
			return
		}

		respondStatus(res, 200)
	})
})

PickerGET.route('/documents/:workOrderId/:fileName', (params, req, res) => {
	const workOrderId = params['workOrderId']
	if (!workOrderId) {
		respondStatus(res, 400, 'Work Order Id missing')
		return
	}
	const fileName = params['fileName']
	if (!fileName) {
		respondStatus(res, 400, 'File Name missing')
		return
	}

	const filePath = path.join(documentStoragePath, `${workOrderId}-${fileName}`)

	if (!fs.existsSync(filePath)) {
		respondStatus(res, 404, 'File not found')
		return
	}

	const readStream = fs.createReadStream(filePath)
	readStream.on('open', () => {
		res.statusCode = 200
		readStream.pipe(res)
	})
	readStream.on('error', (err) => {
		logger.error(`Could not read file: "${filePath}": ${err}`)
		respondStatus(res, 500, 'Could not read file')
	})
})

PickerDELETE.route('/documents/:workOrderId/:fileName', (params, req, res) => {
	if (!checkAuthorized(req)) {
		respondStatus(res, 401, 'Unauthorized')
		return
	}

	const workOrderId = params['workOrderId']
	if (!workOrderId) {
		respondStatus(res, 400, 'Work Order Id missing')
		return
	}
	const fileName = params['fileName']
	if (!fileName) {
		respondStatus(res, 400, 'File Name missing')
		return
	}

	const filePath = path.join(documentStoragePath, `${workOrderId}-${fileName}`)

	if (!fs.existsSync(filePath)) {
		respondStatus(res, 404, 'File not found')
		return
	}

	fs.unlink(filePath, (err) => {
		if (err) {
			respondStatus(res, 500, 'Could not delete file')
		}

		respondStatus(res, 200)
	})
})
