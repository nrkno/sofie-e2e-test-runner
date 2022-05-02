import { Tracker } from 'meteor/tracker'
import { GitRepositorySourceType, Sources } from '../../lib/collections/Sources'

Tracker.autorun(() => {
	Sources.find().forEach((source) => {
		switch (source.type) {
			case GitRepositorySourceType.Tests:
				break
		}
	})
})
