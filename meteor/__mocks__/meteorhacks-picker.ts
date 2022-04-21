import { IncomingMessage, ServerResponse } from 'http'
import { Response as MockResponse, MockResponseData } from 'mock-http'

export interface Params {
	[key: string]: string
}

export type FilterFunction = (req: IncomingMessage, res: ServerResponse) => boolean
export type HandlerFunction = (params: Params, req: IncomingMessage, response: ServerResponse, next: () => void) => void

export interface PickerMockRoute {
	filter?: FilterFunction
	handler: HandlerFunction
}

export class PickerMock {
	static mockRoutes: { [name: string]: PickerMockRoute } = {}
	static route(routeName: string, fcn: HandlerFunction) {
		this.mockRoutes[routeName] = { handler: fcn }
	}

	static filter(fcn: FilterFunction) {
		return new Router(fcn)
	}
}
export class Router {
	private filter: FilterFunction

	constructor(filter: FilterFunction) {
		this.filter = filter
	}

	middleware() {
		// todo
	}
	route(routeName: string, fcn: HandlerFunction) {
		PickerMock.mockRoutes[routeName] = {
			filter: this.filter,
			handler: fcn,
		}
	}
}
export function setup() {
	return {
		Picker: PickerMock,
	}
}

export interface MockResponseDataString extends MockResponseData {
	bufferStr: string
	statusCode: number
}

export function parseResponseBuffer(res: MockResponse, encoding?: BufferEncoding): MockResponseDataString {
	const internal = res._internal
	const bufferStr = internal.buffer.toString(encoding)
	return {
		...internal,
		bufferStr,
		statusCode: res.statusCode,
	}
}
