import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CLIENT_RELATIVE_CANDIDATES = [
  './client',
  './src/client',
  '../client',
  '../../client',
  '../src/client',
  '../../src/client',
] as const

export function resolveClientRoot(from: string = import.meta.url): string {
  const baseDir = path.dirname(fileURLToPath(from))

  for (const candidate of CLIENT_RELATIVE_CANDIDATES) {
    const resolved = path.resolve(baseDir, candidate)
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      return resolved
    }
  }

  throw new Error(
    `Unable to resolve devtools client directory. Looked in ${CLIENT_RELATIVE_CANDIDATES.join(', ')}.`,
  )
}
