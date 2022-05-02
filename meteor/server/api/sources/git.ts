import simpleGit from 'simple-git'
import rimraf from 'rimraf'
import * as path from 'path'
import { GitRepositorySourceId } from '../../../lib/collections/Sources'
import { fsWriteFile, getTempDir } from '../../lib'
import { unprotectString } from '../../../lib/protectedString'
import * as fs from 'fs'

export async function scanGit(sourceId: GitRepositorySourceId, url: string, sshKey?: string): Promise<string[]> {
	const dir = path.join(getTempDir(), unprotectString(sourceId))

	if (fs.existsSync(dir)) {
		await new Promise<void>((resolve, reject) => {
			rimraf(dir, (err) => {
				if (err) reject(err)
				resolve()
			})
		})
	}
	await fs.promises.mkdir(dir)

	let git = simpleGit({
		baseDir: dir,
	})
	if (sshKey) {
		const sshKeyFilePath = path.join(getTempDir(), `${sourceId}_ssh_key`)
		const sshKnownHosts = process.platform === 'win32' ? 'NUL' : '/dev/null'
		fsWriteFile(sshKeyFilePath, sshKey)
		const GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=${sshKnownHosts} -o StrictHostKeyChecking=no -i ${sshKeyFilePath}`
		git = git.env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
	}

	await git.clone(url, dir)
	const branches = await git.branch()
	const tags = await git.tags()

	return [...tags.all, ...Object.values(branches.branches).map((branch) => branch.name)]
}
