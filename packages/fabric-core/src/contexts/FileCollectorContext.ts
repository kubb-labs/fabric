import { createContext } from '../context.ts'
import { FileCollector } from '../utils/FileCollector.ts'

/**
 * Context for collecting files
 */
export const FileCollectorContext = createContext<FileCollector>(new FileCollector())
