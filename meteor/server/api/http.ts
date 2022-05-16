import { Picker } from 'meteor/meteorhacks:picker'
import * as bodyParser from 'body-parser'

// Set up and expose server-side router:

export const PickerPOST = Picker.filter((req) => req.method === 'POST')

PickerPOST.middleware(
	bodyParser.json({
		limit: '200mb', // Arbitrary limit
	})
)
PickerPOST.middleware(
	bodyParser.text({
		type: 'application/json',
		limit: '200mb',
	})
)
PickerPOST.middleware(
	bodyParser.text({
		type: 'text/javascript',
		limit: '200mb',
	})
)

export const PickerPUT = Picker.filter((req) => req.method === 'PUT')

PickerPUT.middleware(
	bodyParser.raw({
		// accept application/octet-stream, image/* and video/*
		type: (req) =>
			req.headers['content-type']?.match(/^application\/octet-stream(?:$|;\s)|^image\/|^video\/|^text\//),
		limit: '200mb', // Arbitrary limit
	})
)
PickerPUT.middleware(
	bodyParser.text({
		type: 'application/json',
		limit: '200mb',
	})
)
PickerPUT.middleware(
	bodyParser.text({
		type: 'text/javascript',
		limit: '200mb',
	})
)

export const PickerGET = Picker.filter((req) => req.method === 'GET')

export const PickerDELETE = Picker.filter((req) => req.method === 'DELETE')
