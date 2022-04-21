export interface VariousAPI {
	addTestData(name: string): Promise<void>
}

export enum VariousAPIMethods {
	'addTestData' = 'various.addTestData',
}
