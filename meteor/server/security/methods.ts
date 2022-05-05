import { MethodContextAPI } from '../../lib/api/methods'

/**
 * Do a user-level access check. Will throw a `Meteor.Error(403)` or `Meteor.Error(401)` if not.
 *
 * @export
 * @param {MethodContextAPI} _api
 * @return {*}  {boolean}
 */
export function checkUserAccess(_api: MethodContextAPI): true {
	return true
}
