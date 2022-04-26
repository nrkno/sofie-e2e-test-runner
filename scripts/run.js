const process = require('process');
const concurrently = require("concurrently");
const args = process.argv.slice(2);

const config = {
	uiOnly: (args.indexOf('--ui-only') >= 0) || false,
	inspectMeteor: (args.indexOf('--inspect-meteor') >= 0) || false
}

function watchMeteor() {
	return [
		{
			command: "meteor yarn watch-types -- --preserveWatchOutput",
			cwd: "meteor",
			name: "METEOR-TSC",
			prefixColor: 'blue',
		},
		{
			command: "meteor yarn debug" + (config.inspectMeteor ? ' --inspect' : ''),
			cwd: "meteor",
			name: "METEOR",
			prefixColor: 'cyan',
		}
	]
}

(async () => {
	// // Pre-steps
	// await concurrently(
	// 	[
	// 		{
	// 			command: "yarn build:try || true",
	// 			cwd: "packages",
	// 			name: "PACKAGES-BUILD",
	// 			prefixColor: 'yellow',
	// 		},
	// 	],
	// 	{
	// 		prefix: "name",
	// 		killOthers: ["failure", "success"],
	// 		restartTries: 1,
	// 	}
	// );

	// The main watching execution
	await concurrently(
		[
			// ...(config.uiOnly ? [] : watchPackages()),
			// ...(config.uiOnly ? [] : watchWorker()),
			...watchMeteor(),
		],
		{
			prefix: "name",
			killOthers: ["failure", "success"],
			restartTries: 0,
		}
	);
})();
