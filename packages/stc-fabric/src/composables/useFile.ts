import { inject } from '../context.ts'
import { FileCollectorContext } from '../components/File.ts'
import type { FileCollector } from '@kubb/fabric-core'

/**
 * `useFile` will return the current FileCollector for registering files.
 */
export function useFile(): FileCollector | null {
  const collector = inject(FileCollectorContext, null)

  return collector
}
