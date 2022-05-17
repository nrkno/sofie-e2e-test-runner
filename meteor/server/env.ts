import path from 'path'

export const Env = {
	// Temporary folder that can be used for cloning Git repositories
	TMP: process.env.TMP ?? './tmp',
	// HTTP server, supporting arbitrary PUT & DELETE for blob storage
	DOCUMENT_STORAGE_URL: process.env.DOCUMENT_STORAGE_URL ?? 'http://localhost:3000/documents',
	// File path to store the blobs
	DOCUMENT_STORAGE_PATH: process.env.DOCUMENT_STORAGE_PATH ?? path.join(process.env.HOME ?? '.', 'sofie-e2e-docs'),
	// String to be used for Authorization HTTP header - built-in HTTP documents server will check if this matches that if set
	DOCUMENT_STORAGE_AUTH: process.env.DOCUMENT_STORAGE_AUTH ?? undefined,
	// Working directory for the executor script
	EXECUTOR_CWD: process.env.EXECUTOR_CWD ?? path.normalize(path.join(process.cwd(), '../../../../../../scripts')),
}
