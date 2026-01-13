import { inject } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import type { FileCollector } from '../utils/FileCollector.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 */
export function useFile(): FileCollector {
  const collector = inject(FileCollectorContext, null)

  if (!collector) {
    throw new Error('No FileCollector found in context. Make sure you are using a Fabric that provides a FileCollector.')
  }

  return collector
}
