import { APP_NAME } from '../../../lib/constants'

export function pageTitle(title: string): string {
	return `${title} - ${APP_NAME}`
}
