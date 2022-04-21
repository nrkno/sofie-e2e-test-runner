import moment from 'moment'

export function formatDuration(duration: number): string {
	// return moment.utc(duration).format('HH:mm:ss.SSS')
	return moment.utc(duration).format('H:mm:ss.S')
}
