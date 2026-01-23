import { FileContext } from '../contexts/FileContext.ts'
import type * as KubbFile from '../KubbFile.ts'
import { useContext } from './useContext.ts'

/**
 * Accesses the current File context.
 *
 * Use this composable to access or modify the current file's properties,
 * sources, imports, or exports.
 *
 * @returns The current file object or null if not within a File component
 *
 * @example
 * ```ts
 * const file = useFile()
 * if (file) {
 *   console.log(file.path)
 *   file.sources.push({ value: 'export const x = 1', isExportable: true })
 * }
 * ```
 */
export function useFile(): KubbFile.ResolvedFile | null {
  return useContext(FileContext)
}
