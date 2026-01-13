import { createContext } from '../context.ts'
import type * as KubbFile from '../KubbFile.ts'
import type { FileCollector } from '../utils/FileCollector.ts'

/**
 * Context for collecting files - provided by createFsxFabric
 */
export const FileCollectorContext = createContext<FileCollector | null>(null)

/**
 * Context for the current file being processed
 */
type CurrentFileContext = {
  sources: KubbFile.Source[]
  imports: KubbFile.Import[]
  exports: KubbFile.Export[]
}
export const CurrentFileContext = createContext<CurrentFileContext | null>(null)
