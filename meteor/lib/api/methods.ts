import * as _ from 'underscore'
import { MeteorPromiseCall } from '../lib'
import { Meteor } from 'meteor/meteor'
import { VariousAPI, VariousAPIMethods } from './various'
import { SourcesAPI, SourcesAPIMethods } from './sources'

/** All methods typings are defined here, the actual implementation is defined in other places */
export type MethodsBase = {
	[key: string]: (...args: any[]) => Promise<any>
}
interface IMeteorCall {
	various: VariousAPI
	sources: SourcesAPI
}
export const MeteorCall: IMeteorCall = {
	various: makeMethods(VariousAPIMethods),
	sources: makeMethods(SourcesAPIMethods),
}
function makeMethods(methods: object): any {
	const o = {}
	_.each(methods, (value: any, methodName: string) => {
		o[methodName] = async (...args) => MeteorPromiseCall(value, ...args)
	})
	return o
}
export interface MethodContext extends Omit<Meteor.MethodThisType, 'userId'> {
	userId: string | null
}

/** Abstarct class to be used when defining Mehod-classes */
export abstract class MethodContextAPI implements MethodContext {
	public userId: string | null
	public isSimulation: boolean
	public setUserId(_userId: string): void {
		throw new Meteor.Error(
			500,
			`This shoulc never be called, there's something wrong in with 'this' in the calling method`
		)
	}
	public unblock(): void {
		throw new Meteor.Error(
			500,
			`This shoulc never be called, there's something wrong in with 'this' in the calling method`
		)
	}
	public connection: Meteor.Connection | null
}
