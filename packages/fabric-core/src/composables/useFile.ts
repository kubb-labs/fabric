import type { FileCollector } from '../FileCollector.ts'
import { FileCollectorContext } from '../components/File.ts'
import { inject } from '../context.ts'

/**
 * `useFile` will return the current FileCollector for registering files.
 */
export function useFile(): FileCollector | null {
  const collector = inject(FileCollectorContext, null)

  return collector
}
