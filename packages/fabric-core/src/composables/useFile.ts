import type { FileCollector } from '../utils/FileCollector.ts'
import { useFileCollector } from './useFileCollector.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 *
 * Throws when no FileCollector is present in context — ensure a Fabric that
 * provides a FileCollector is mounted before calling this hook.
 */
export function useFile(): FileCollector {
  // use custom file context
  const collector = useFileCollector()

  if (!collector) {
    throw new Error('No FileCollector found in context. Make sure you are using a Fabric that provides a FileCollector.')
  }

  return collector
}
