import * as _ from 'underscore'
import { AsyncMongoCollection } from './collections/lib'
import { CollectionName } from './collections/Collections'
import { Meteor } from 'meteor/meteor'
import { ProtectedString, protectString } from './protectedString'
import { logger } from './logging'
import { UserError } from './error'

import * as crypto from 'crypto'
import { ITranslatableMessage } from './TranslatableMessage'
import { Random } from 'meteor/random'

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash
		.update(str)
		.digest('base64')
		.replace(/[\+\/\=]/g, '_') // remove +/= from strings, because they cause troubles
}
/** Creates a hash based on the object properties (excluding ordering of properties) */
export function hashObj(obj: any): string {
	if (typeof obj === 'object') {
		const keys = Object.keys(obj).sort((a, b) => {
			if (a > b) return 1
			if (a < b) return -1
			return 0
		})

		const strs: string[] = []
		for (const key of keys) {
			strs.push(hashObj(obj[key]))
		}
		return getHash(strs.join('|'))
	}
	return obj + ''
}

/**
 * Convenience method to convert a Meteor.call() into a Promise
 * @param  {string} Method name
 * @return {Promise<any>}
 */
export async function MeteorPromiseCall(callName: string, ...args: any[]): Promise<any> {
	return new Promise((resolve, reject) => {
		Meteor.call(callName, ...args, (err, res) => {
			if (err) reject(err)
			else resolve(res)
		})
	})
}

export type Time = number
export type TimeDuration = number

// The diff is currently only used client-side
const systemTime = {
	hasBeenSet: false,
	diff: 0,
	stdDev: 9999,
	lastSync: 0,
	timeOriginDiff: 0,
}
/**
 * Returns the current (synced) time.
 * If NTP-syncing is enabled, it'll be unaffected of whether the client has a well-synced computer time or not.
 * @return {Time}
 */
export function getCurrentTime(): Time {
	return Math.floor(Date.now() - (Meteor.isServer ? 0 : systemTime.diff))
}
export { systemTime }

export interface DBObj {
	_id: ProtectedString<any>
	[key: string]: any
}

export type Partial<T> = {
	[P in keyof T]?: T[P]
}
export function partial<T>(o: Partial<T>) {
	return o
}

export function literal<T>(o: T): T {
	return o
}

/**
 * Convert an array to a object, keyed on an id generator function.
 * `undefined` key values will get filtered from the object
 * Duplicate keys will cause entries to replace others silently
 *
 * ```
 * normalizeArrayFuncFilter([{ a: 1, b: 2}], (o) => `${o.a + o.b}`)
 * ```
 */
export function normalizeArrayFuncFilter<T>(
	array: Array<T>,
	getKey: (o: T) => string | undefined
): { [indexKey: string]: T } {
	const normalizedObject: { [indexKey: string]: T } = {}
	for (const obj of array) {
		const key = getKey(obj)
		if (key !== undefined) {
			normalizedObject[key] = obj
		}
	}
	return normalizedObject
}
/**
 * Convert an array to a object, keyed on an id generator function.
 * Duplicate keys will cause entries to replace others silently
 *
 * ```
 * normalizeArrayFunc([{ a: 1, b: 2}], (o) => `${o.a + o.b}`)
 * ```
 */
export function normalizeArrayFunc<T>(array: Array<T>, getKey: (o: T) => string): { [indexKey: string]: T } {
	const normalizedObject: { [indexKey: string]: T } = {}
	for (const obj of array) {
		normalizedObject[getKey(obj)] = obj
	}
	return normalizedObject as { [key: string]: T }
}
/**
 * Convert an array to a object, keyed on an `id` field.
 * Duplicate keys will cause entries to replace others silently
 *
 * ```
 * normalizeArray([{ a: '1', b: 2}], 'a')
 * ```
 */
export function normalizeArray<T>(array: Array<T>, indexKey: keyof T): { [indexKey: string]: T } {
	const normalizedObject: any = {}
	for (const obj of array) {
		normalizedObject[obj[indexKey]] = obj
	}
	return normalizedObject as { [key: string]: T }
}
/**
 * Convert an array to a Map, keyed on an `id` field.
 * Duplicate keys will cause entries to replace others silently
 *
 * ```
 * normalizeArrayToMap([{ a: '1', b: 2}], 'a')
 * ```
 */
export function normalizeArrayToMap<T, K extends keyof T>(array: readonly T[], indexKey: K): Map<T[K], T> {
	const normalizedObject = new Map<T[K], T>()
	for (const item of array) {
		normalizedObject.set(item[indexKey], item)
	}
	return normalizedObject
}
/**
 * Convert an array to a Map, keyed on an id generator function.
 * `undefined` key values will get filtered from the map
 * Duplicate keys will cause entries to replace others silently
 *
 * ```
 * normalizeArrayToMapFunc([{ a: 1, b: 2}], (o) => o.a + o.b)
 * ```
 */
export function normalizeArrayToMapFunc<T, K>(array: Array<T>, getKey: (o: T) => K | undefined): Map<K, T> {
	const normalizedObject = new Map<K, T>()
	for (const item of array) {
		const key = getKey(item)
		if (key !== undefined) {
			normalizedObject.set(key, item)
		}
	}
	return normalizedObject
}

/**
 * Recursively delete all undefined properties from the supplied object.
 * This is necessary as _.isEqual({ a: 1 }, { a: 1, b: undefined }) === false
 */
export function deleteAllUndefinedProperties<T>(obj: T): void {
	if (Array.isArray(obj)) {
		for (const v of obj) {
			deleteAllUndefinedProperties(v)
		}
	} else if (obj && typeof obj === 'object') {
		for (const key in obj) {
			if (obj[key] === undefined) {
				delete obj[key]
			} else {
				deleteAllUndefinedProperties(obj[key])
			}
		}
	}
}

export function getRandomString(numberOfChars?: number): string {
	return Random.id(numberOfChars)
}

export function getRandomId<T extends ProtectedString<any>>(numberOfChars?: number): T {
	return protectString(getRandomString(numberOfChars))
}

export interface IDObj {
	_id: ProtectedString<any>
}
export function partialExceptId<T>(o: Partial<T> & IDObj) {
	return o
}
export interface ObjId {
	_id: ProtectedString<any>
}

/**
 * Formats the time as human-readable time "YYYY-MM-DD hh:ii:ss"
 * @param time
 */
export function formatDateTime(time: Time) {
	const d = new Date(time)

	const yyyy: any = d.getFullYear()
	let mm: any = d.getMonth() + 1
	let dd: any = d.getDate()

	let hh: any = d.getHours()
	let ii: any = d.getMinutes()
	let ss: any = d.getSeconds()

	if (mm < 10) mm = '0' + mm
	if (dd < 10) dd = '0' + dd
	if (hh < 10) hh = '0' + hh
	if (ii < 10) ii = '0' + ii
	if (ss < 10) ss = '0' + ss

	return `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`
}
/**
 * Returns a string that can be used to compare objects for equality
 * @param objs
 */
export function stringifyObjects(objs: any): string {
	if (_.isArray(objs)) {
		return _.map(objs, (obj) => {
			if (obj !== undefined) {
				return stringifyObjects(obj)
			}
		}).join(',')
	} else if (_.isFunction(objs)) {
		return ''
	} else if (_.isObject(objs)) {
		const keys = _.sortBy(_.keys(objs), (k) => k)

		return _.compact(
			_.map(keys, (key) => {
				if (objs[key] !== undefined) {
					return key + '=' + stringifyObjects(objs[key])
				} else {
					return null
				}
			})
		).join(',')
	} else {
		return objs + ''
	}
}
export const Collections = new Map<CollectionName, AsyncMongoCollection<any>>()
export function registerCollection(name: CollectionName, collection: AsyncMongoCollection<any>) {
	if (Collections.has(name)) throw new Meteor.Error(`Cannot re-register collection "${name}"`)
	Collections.set(name, collection)
}
export function getCollectionKey(collection: AsyncMongoCollection<any>): CollectionName {
	const o = Array.from(Collections.entries()).find(([_key, col]) => col === collection)
	if (!o) throw new Meteor.Error(500, `Collection "${collection.name}" not found in Collections!`)
	return o[0] // collectionName
}

/** Convenience function, to be used when length of array has previously been verified */
export function last<T>(values: T[]): T {
	return _.last(values) as T
}

const cacheResultCache: {
	[name: string]: {
		ttl: number
		value: any
	}
} = {}
/** Cache the result of function for a limited time */
export function cacheResult<T>(name: string, fcn: () => T, limitTime: number = 1000) {
	if (Math.random() < 0.01) {
		Meteor.setTimeout(cleanOldCacheResult, 10000)
	}
	const cache = cacheResultCache[name]
	if (!cache || cache.ttl < Date.now()) {
		const value: T = fcn()
		cacheResultCache[name] = {
			ttl: Date.now() + limitTime,
			value: value,
		}
		return value
	} else {
		return cache.value
	}
}
/** Cache the result of function for a limited time */
export async function cacheResultAsync<T>(name: string, fcn: () => Promise<T>, limitTime: number = 1000): Promise<T> {
	if (Math.random() < 0.01) {
		Meteor.setTimeout(cleanOldCacheResult, 10000)
	}
	const cache = cacheResultCache[name]
	if (!cache || cache.ttl < Date.now()) {
		const value: Promise<T> = fcn()
		cacheResultCache[name] = {
			ttl: Date.now() + limitTime,
			value: value,
		}
		return value
	} else {
		return cache.value
	}
}
export function clearCacheResult(name: string) {
	delete cacheResultCache[name]
}
function cleanOldCacheResult() {
	_.each(cacheResultCache, (cache, name) => {
		if (cache.ttl < Date.now()) clearCacheResult(name)
	})
}
const lazyIgnoreCache: { [name: string]: number } = {}
export function lazyIgnore(name: string, f1: () => void, t: number): void {
	// Don't execute the function f1 until the time t has passed.
	// Subsequent calls will extend the lazyness and ignore the previous call

	if (lazyIgnoreCache[name]) {
		Meteor.clearTimeout(lazyIgnoreCache[name])
	}
	lazyIgnoreCache[name] = Meteor.setTimeout(() => {
		delete lazyIgnoreCache[name]
		f1()
	}, t)
}

export function escapeHtml(text: string): string {
	// Escape strings, so they are XML-compatible:

	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	}
	const nbsp = String.fromCharCode(160) // non-breaking space (160)
	map[nbsp] = ' ' // regular space

	const textLength = text.length
	let outText = ''
	for (let i = 0; i < textLength; i++) {
		const c = text[i]
		if (map[c]) {
			outText += map[c]
		} else {
			outText += c
		}
	}
	return outText
}
const ticCache = {}
/**
 * Performance debugging. tic() starts a timer, toc() traces the time since tic()
 * @param name
 */
export function tic(name: string = 'default') {
	ticCache[name] = Date.now()
}
export function toc(name: string = 'default', logStr?: string | Promise<any>[]) {
	if (_.isArray(logStr)) {
		_.each(logStr, (promise, i) => {
			promise
				.then((result) => {
					toc(name, 'Promise ' + i)
					return result
				})
				.catch((e) => {
					throw e
				})
		})
	} else {
		const t: number = Date.now() - ticCache[name]
		if (logStr) logger.info('toc: ' + name + ': ' + logStr + ': ' + t)
		return t
	}
}

// export function MeteorWrapAsync(func: Function, context?: Object): any {
// 	// A variant of Meteor.wrapAsync to fix the bug
// 	// https://github.com/meteor/meteor/issues/11120

// 	return Meteor.wrapAsync((...args: any[]) => {
// 		// Find the callback-function:
// 		for (let i = args.length - 1; i >= 0; i--) {
// 			if (typeof args[i] === 'function') {
// 				if (i < args.length - 1) {
// 					// The callback is not the last argument, make it so then:
// 					const callback = args[i]
// 					const fixedArgs = args
// 					fixedArgs[i] = undefined
// 					fixedArgs.push(callback)

// 					func.apply(context, fixedArgs)
// 					return
// 				} else {
// 					// The callback is the last argument, that's okay
// 					func.apply(context, args)
// 					return
// 				}
// 			}
// 		}
// 		throw new Meteor.Error(500, `Error in MeteorWrapAsync: No callback found!`)
// 	})
// }

/**
 * Blocks the fiber until all the Promises have resolved
 */
export function waitForPromiseAll<T1, T2, T3, T4, T5, T6>(
	ps: [
		T1 | PromiseLike<T1>,
		T2 | PromiseLike<T2>,
		T3 | PromiseLike<T3>,
		T4 | PromiseLike<T4>,
		T5 | PromiseLike<T5>,
		T6 | PromiseLike<T6>
	]
): [T1, T2, T3, T4, T5, T6]
export function waitForPromiseAll<T1, T2, T3, T4, T5>(
	ps: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]
): [T1, T2, T3, T4, T5]
export function waitForPromiseAll<T1, T2, T3, T4>(
	ps: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]
): [T1, T2, T3, T4]
export function waitForPromiseAll<T1, T2, T3>(
	ps: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]
): [T1, T2, T3]
export function waitForPromiseAll<T1, T2>(ps: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): [T1, T2]
export function waitForPromiseAll<T>(ps: (T | PromiseLike<T>)[]): T[]
export function waitForPromiseAll<T>(ps: (T | PromiseLike<T>)[]): T[] {
	return waitForPromise(Promise.all(ps))
}

export type Promisify<T> = { [K in keyof T]: Promise<T[K]> }
export function waitForPromiseObj<T extends object>(obj: Promisify<T>): T {
	const values = waitForPromiseAll(_.values<Promise<any>>(obj))
	return _.object(_.keys(obj), values) as T
}

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T

/**
 * Convert a promise to a "synchronous" Fiber function
 * Makes the Fiber wait for the promise to resolve, then return the value of the promise.
 * If the fiber rejects, the function in the Fiber will "throw"
 */
export const waitForPromise: <T>(p: Promise<T> | T) => Awaited<T> = Meteor.wrapAsync(function waitForPromise<T>(
	p: Promise<T> | T,
	cb: (err: any | null, result?: any) => Awaited<T>
) {
	if (Meteor.isClient) throw new Meteor.Error(500, `waitForPromise can't be used client-side`)
	if (cb === undefined && typeof p === 'function') {
		cb = p as any
		p = undefined as any
	}

	Promise.resolve(p)
		.then((result) => {
			cb(null, result)
		})
		.catch((e) => {
			cb(e)
		})
})
/**
 * Convert a Fiber function into a promise
 * Makes the Fiber function to run in its own fiber and return a promise
 */
export async function makePromise<T>(fcn: () => T): Promise<T> {
	return new Promise((resolve, reject) => {
		Meteor.defer(() => {
			try {
				resolve(fcn())
			} catch (e) {
				reject(e)
			}
		})
	})
}

/**
 * Replaces all invalid characters in order to make the path a valid one
 * @param path
 */
export function fixValidPath(path) {
	return path.replace(/([^a-z0-9_.@()-])/gi, '_')
}

/**
 * Thanks to https://github.com/Microsoft/TypeScript/issues/23126#issuecomment-395929162
 */
export type OptionalPropertyNames<T> = {
	[K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]
export type RequiredPropertyNames<T> = {
	[K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]
export type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>
export type RequiredProperties<T> = Pick<T, RequiredPropertyNames<T>>

export type Diff<T, U> = T extends U ? never : T // Remove types from T that are assignable to U
export type KeysByType<TObj, TVal> = Diff<
	{
		[K in keyof TObj]: TObj[K] extends TVal ? K : never
	}[keyof TObj],
	undefined
>

/**
 * Returns the difference between object A and B
 */
type Difference<A, B extends A> = Pick<B, Exclude<keyof B, keyof RequiredProperties<A>>>
/**
 * Somewhat like _.extend, but with strong types & mandated additional properties
 * @param original Object to be extended
 * @param extendObj properties to add
 */
export function extendMandadory<A, B extends A>(original: A, extendObj: Difference<A, B> & Partial<A>): B {
	return _.extend(original, extendObj)
}

export function trimIfString<T>(value: T): T | string {
	if (_.isString(value)) return value.trim()
	return value
}

export function firstIfArray<T>(value: T | T[] | null | undefined): T | null | undefined
export function firstIfArray<T>(value: T | T[] | null): T | null
export function firstIfArray<T>(value: T | T[] | undefined): T | undefined
export function firstIfArray<T>(value: T | T[]): T
export function firstIfArray<T>(value: any): T {
	return _.isArray(value) ? _.first(value) : value
}

/**
 * Wait for specified time
 * @param time
 */
export function waitTime(time: number) {
	waitForPromise(sleep(time))
}
export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => Meteor.setTimeout(resolve, ms))
}

export function isPromise<T>(val: any): val is Promise<T> {
	return _.isObject(val) && typeof val.then === 'function' && typeof val.catch === 'function'
}

/**
 * This is a fast, shallow compare of two Sets.
 *
 * **Note**: This is a shallow compare, so it will return false if the objects in the arrays are identical, but not the same.
 *
 * @param a
 * @param b
 */
export function equalSets<T>(a: Set<T>, b: Set<T>): boolean {
	if (a === b) return true
	if (a.size !== b.size) return false
	for (const val of a.values()) {
		if (!b.has(val)) return false
	}
	return true
}

export function assertNever(_never: never): void {
	// Do nothing. This is a type guard
}

/**
 * This is a fast, shallow compare of two arrays that are used as unsorted lists. The ordering of the elements is ignored.
 *
 * **Note**: This is a shallow compare, so it will return false if the objects in the arrays are identical, but not the same.
 *
 * @param a
 * @param b
 */
export function equivalentArrays<T>(a: T[], b: T[]): boolean {
	if (a === b) return true
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (!b.includes(a[i])) return false
	}
	return true
}

/**
 * This is a fast, shallow compare of two arrays of the same type.
 *
 * **Note**: This is a shallow compare, so it will return false if the objects in the arrays are identical, but not the same.
 * @param a
 * @param b
 */
export function equalArrays<T>(a: T[], b: T[]): boolean {
	if (a === b) return true
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (b[i] !== a[i]) return false
	}
	return true
}

/** Generate the translation for a string, to be applied later when it gets rendered */
export function generateTranslation(key: string, args?: { [k: string]: any }): ITranslatableMessage {
	return {
		key,
		args,
	}
}

export enum LogLevel {
	SILLY = 'silly',
	DEBUG = 'debug',
	VERBOSE = 'verbose',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	NONE = 'crit',
}

/** Make a string out of an error (or other equivalents), including any additional data such as stack trace if available */
export function stringifyError(error: unknown, noStack = false): string {
	let str: string | undefined = undefined

	if (error && UserError.isUserError(error)) {
		// Is a UserError
		str = UserError.toJSON(error)
	} else if (error && typeof error === 'object') {
		if ((error as Error).message) {
			// Is an Error
			str = `${(error as Error).message}`
		} else if ((error as any).reason) {
			// Is a Meteor.Error
			str = `${(error as any).reason}`
		} else if ((error as any).details) {
			str = `${(error as any).details}`
		} else {
			try {
				// Try to stringify the object:
				str = JSON.stringify(error)
			} catch (e) {
				str = `${error} (stringifyError: ${e})`
			}
		}
	} else {
		str = `${error}`
	}

	if (!noStack) {
		if (error && typeof error === 'object' && (error as any).stack) {
			str += ', ' + (error as any).stack
		}
	}

	return str
}
