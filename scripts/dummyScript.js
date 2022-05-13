function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

(async function () {
	console.log('Starting long process...')
	await sleep(10000)
	console.log('Some more proccessing...')
	await sleep(10000)
	console.error('Some error happened')
	await sleep(10000)
	console.log('Some more output')
	await sleep(10000)
	console.log('Finishing')
})().catch(console.error)
