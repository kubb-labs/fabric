import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import type { FileCollector } from '../utils/FileCollector.ts'
import { useContext } from './useContext.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 *
 * Throws when no FileCollector is present in context — ensure a Fabric that
 * provides a FileCollector is mounted before calling this hook.
 */
export function useFile(): FileCollector {
  const collector = useContext(FileCollectorContext, null)

  if (!collector) {
    throw new Error('No FileCollector found in context. Make sure you are using a Fabric that provides a FileCollector.')
  }

  return collector
}
