import path from 'path'

export const Env = {
	TMP: process.env.TMP ?? './tmp',
	DOCUMENT_STORAGE_URL: process.env.DOCUMENT_STORAGE_URL ?? 'http://localhost:3000/documents',
	DOCUMENT_STORAGE_PATH: process.env.DOCUMENT_STORAGE_PATH ?? path.join(process.env.HOME ?? '.', 'sofie-e2e-docs'),
	DOCUMENT_STORAGE_AUTH: process.env.DOCUMENT_STORAGE_AUTH ?? undefined,
	EXECUTOR_CWD: process.env.EXECUTOR_CWD ?? path.normalize(path.join(process.cwd(), '../../../../../../scripts')),
}
