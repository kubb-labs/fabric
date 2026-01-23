import { RootContext } from '../contexts/RootContext.ts'
import type { FileManager } from '../FileManager.ts'
import { useContext } from './useContext.ts'

/**
 * Accesses the FileManager from the Root context.
 *
 * Use this composable to interact with the FileManager directly,
 * such as adding, retrieving, or managing files.
 *
 * @returns The current FileManager instance
 *
 * @example
 * ```ts
 * const fileManager = useFileManager()
 * fileManager.add({
 *   baseName: 'user.ts',
 *   path: './generated/user.ts',
 *   sources: []
 * })
 * ```
 */
export function useFileManager(): FileManager {
  const { fileManager } = useContext(RootContext)

  return fileManager
}
