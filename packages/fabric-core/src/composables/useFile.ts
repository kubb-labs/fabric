import { FileContext } from '../contexts/FileContext.ts'
import type * as KubbFile from '../KubbFile.ts'
import { useContext } from './useContext.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 *
 * Throws when no FileCollector is present in context — ensure a Fabric that
 * provides a FileCollector is mounted before calling this hook.
 */
export function useFile(): KubbFile.ResolvedFile | null {
  return useContext(FileContext)
}
