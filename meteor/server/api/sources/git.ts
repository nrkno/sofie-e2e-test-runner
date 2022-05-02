import simpleGit, { CleanOptions } from 'simple-git'
import * as path from 'path'
import { GitRepositorySourceId } from '../../../lib/collections/Sources'
import { fsWriteFile, getTempDir } from '../../lib'
import { unprotectString } from '../../../lib/protectedString'
import * as fs from 'fs'

export async function scanGit(sourceId: GitRepositorySourceId, url: string, sshKey?: string): Promise<string[]> {
	const dir = path.join(getTempDir(), unprotectString(sourceId))

	let GIT_SSH_COMMAND = ''
	if (sshKey) {
		const sshKeyFilePath = path.join(getTempDir(), `${sourceId}_ssh_key`)
		const sshKnownHosts = process.platform === 'win32' ? 'NUL' : '/dev/null'
		fsWriteFile(sshKeyFilePath, sshKey)
		GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=${sshKnownHosts} -o StrictHostKeyChecking=no -i ${sshKeyFilePath}`
	}

	let isFresh = false
	if (!fs.existsSync(dir)) {
		await fs.promises.mkdir(dir)
		isFresh = true
	}

	let git = simpleGit({
		baseDir: dir,
	})

	if (sshKey) {
		git = git.env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
	}

	if (isFresh) {
		await git.clone(url, dir)
	} else {
		await git.clean(CleanOptions.FORCE)
	}

	const branches = await git.branch()
	const tags = await git.tags()

	return [...tags.all, ...Object.values(branches.branches).map((branch) => branch.name)]
}
