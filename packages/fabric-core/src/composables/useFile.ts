import { inject } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import type { FileCollector } from '../utils/FileCollector.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 */
export function useFile(): FileCollector | null {
  const collector = inject(FileCollectorContext, null)

  return collector
}
