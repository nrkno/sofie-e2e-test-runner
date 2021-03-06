function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

(async function () {
	console.log('Starting long process...')
	await sleep(1000)
	console.log('Some more proccessing...')
	await sleep(500)
	console.error('Some error happened')
	await sleep(500)
	console.log('Some more output')
	await sleep(500)
	console.log('::set-output name=Artifact name::[0, 2, 3, 4, 5, 7]')
	console.log('::set-output name=Pass/fail artifact::tags=some,extra,tags::pass')
	console.log('::set-output test.mp4')
	console.log('::set-output true')
	console.log('Finishing')
})().catch(console.error)
