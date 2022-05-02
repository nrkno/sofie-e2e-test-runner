import * as Winston from 'winston'
import * as fs from 'fs'
import { getAbsolutePath } from './lib'
import { LogLevel, stringifyError } from '../lib/lib'
import { Meteor } from 'meteor/meteor'
import * as _ from 'underscore'

export function getLogLevel(): LogLevel {
	return logger.level as LogLevel
}
export function setLogLevel(level: LogLevel, startup = false) {
	if (logger.level !== level || startup) {
		logger.level = level
		if (transports.console) {
			transports.console.level = level
		}
		if (transports.file) {
			transports.file.level = level
		}
		if (!Meteor.isTest) {
			// Note: We can't use logger.info here, since that might be supressed by the log level.
			console.log(`Setting logger level to "${level}"`)
		}
	}
}

// @todo: remove this and do a PR to https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/winston
// because there's an error in the typings logging.debug() takes any, not only string
interface LoggerInstanceFixed extends Winston.Logger {
	// for cli and npm levels
	error: LeveledLogMethodFixed
	warn: LeveledLogMethodFixed
	help: LeveledLogMethodFixed
	data: LeveledLogMethodFixed
	info: LeveledLogMethodFixed
	debug: LeveledLogMethodFixed
	prompt: LeveledLogMethodFixed
	http: LeveledLogMethodFixed
	verbose: LeveledLogMethodFixed
	input: LeveledLogMethodFixed
	silly: LeveledLogMethodFixed

	// for syslog levels only
	emerg: LeveledLogMethodFixed
	alert: LeveledLogMethodFixed
	crit: LeveledLogMethodFixed
	warning: LeveledLogMethodFixed
	notice: LeveledLogMethodFixed
}
interface LogMeta {
	[key: string]: any
}
interface LeveledLogMethodFixed {
	(msg: any, callback: Winston.LogCallback): LoggerInstanceFixed
	(msg: any, meta: LogMeta, callback: Winston.LogCallback): LoggerInstanceFixed
	(msg: any, ...meta: LogMeta[]): LoggerInstanceFixed
}
const leadingZeros = (num: number | string, length: number) => {
	num = num + ''
	if (num.length < length) {
		return '00000000000000000000000000000000000000000'.slice(0, length - num.length) + num
	} else {
		return num
	}
}
let logToFile = false
if (process.env.LOG_TO_FILE) logToFile = true

let logPath = process.env.LOG_FILE || ''

let logger: LoggerInstanceFixed
let transports: {
	console?: Winston.transports.ConsoleTransportInstance
	file?: Winston.transports.FileTransportInstance
}

function safeStringify(o: any): string {
	try {
		return JSON.stringify(o) // make single line
	} catch (e) {
		return 'ERROR in safeStringify: ' + stringifyError(e)
	}
}
if (logToFile || logPath !== '') {
	if (logPath === '') {
		const time = new Date()
		const startDate =
			time.getFullYear() +
			'-' +
			leadingZeros(time.getMonth(), 2) +
			'-' +
			leadingZeros(time.getDate(), 2) +
			'_' +
			leadingZeros(time.getHours(), 2) +
			'_' +
			leadingZeros(time.getMinutes(), 2) +
			'_' +
			leadingZeros(time.getSeconds(), 2)
		const logDirectory = getAbsolutePath() + '/.meteor/local/log'
		logPath = logDirectory + '/log_' + startDate + '.log'
		// let logPath = './log/'

		if (!fs.existsSync(logDirectory)) {
			fs.mkdirSync(logDirectory)
		}
	}
	const transportConsole = new Winston.transports.Console({
		level: process.env.LOG_LEVEL || 'verbose',
		handleExceptions: true,
		handleRejections: true,
	})
	const transportFile = new Winston.transports.File({
		level: 'silly',
		handleExceptions: true,
		handleRejections: true,
		filename: logPath,
	})

	transports = {
		console: transportConsole,
		file: transportFile,
	}
	logger = Winston.createLogger({
		format: Winston.format.json(),
		transports: [transportConsole, transportFile],
	})
	console.log('Logging to ' + logPath)
} else {
	const transportConsole = new Winston.transports.Console({
		level: process.env.LOG_LEVEL || 'silly',
		handleExceptions: true,
		handleRejections: true,
	})
	transports = {
		console: transportConsole,
	}
	if (Meteor.isProduction) {
		logger = Winston.createLogger({
			format: Winston.format.json(),
			transports: [transportConsole],
		})
	} else {
		const customFormat = Winston.format.printf((o) => {
			const meta = _.omit(o, 'level', 'message', 'timestamp')
			return `[${o.level}] ${o.message} ${!_.isEmpty(meta) ? safeStringify(meta) : ''}`
		})

		logger = Winston.createLogger({
			format: Winston.format.combine(Winston.format.timestamp(), customFormat),
			transports: [transportConsole],
		})
	}
}

process.on('exit', (code) => {
	logger.info(`Process exiting with code: ${code}`)
})

export { logger, transports, LogLevel }
