import simpleGit, { CleanOptions } from 'simple-git'
import rimraf from 'rimraf'
import * as path from 'path'
import { GitRepositorySourceId } from '../../../lib/collections/Sources'
import { getTempDir } from '../../lib'
import { unprotectString } from '../../../lib/protectedString'
import * as fs from 'fs'
import { unique } from '../../../lib/lib'

export function getGitRepositoryPath(sourceId: GitRepositorySourceId): string {
	return path.join(getTempDir(), unprotectString(sourceId))
}

export async function checkoutGitRepo(sourceId: GitRepositorySourceId, url: string, ref: string, sshKey?: string) {
	const dir = getGitRepositoryPath(sourceId)

	let GIT_SSH_COMMAND = ''
	if (sshKey) {
		const sshKnownHosts = process.platform === 'win32' ? 'NUL' : '/dev/null'
		GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=${sshKnownHosts} -o StrictHostKeyChecking=no -i ${sshKey}`
	}

	let isFresh = false
	if (!fs.existsSync(dir)) {
		await fs.promises.mkdir(dir, { recursive: true })
		isFresh = true
	}

	let git = simpleGit({
		baseDir: dir,
	})

	if (sshKey) {
		git = git.env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
	}

	if (isFresh) {
		await git.clone(url, dir, ['--mirror'])
	} else {
		await git.clean(CleanOptions.FORCE)
		await git.fetch(['--prune'])
	}

	await git.checkout(ref)
	await git.pull() // just in case we are behind
}

export async function scanGit(sourceId: GitRepositorySourceId, url: string, sshKey?: string): Promise<string[]> {
	const dir = getGitRepositoryPath(sourceId)

	let GIT_SSH_COMMAND = ''
	if (sshKey) {
		const sshKnownHosts = process.platform === 'win32' ? 'NUL' : '/dev/null'
		GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=${sshKnownHosts} -o StrictHostKeyChecking=no -i ${sshKey}`
	}

	let isFresh = false
	if (!fs.existsSync(dir)) {
		await fs.promises.mkdir(dir, { recursive: true })
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
		await git.fetch(['--prune', '--prune-tags'])
	}

	const branches = await git.branch()
	const tags = await git.tags()

	return [
		...tags.all,
		...unique(Object.values(branches.branches).map((branch) => branch.name.replace(/^remotes\/origin\//, ''))),
	]
}

export async function purgeGit(sourceId: GitRepositorySourceId): Promise<void> {
	const dir = getGitRepositoryPath(sourceId)

	if (fs.existsSync(dir)) {
		return new Promise((resolve, reject) => {
			rimraf(dir, (err) => {
				if (err) {
					reject(err)
					return
				}

				resolve()
			})
		})
	}
}
