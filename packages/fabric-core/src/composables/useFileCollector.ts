import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import type { FileCollector } from '../utils/FileCollector.ts'

import { useContext } from './useContext.ts'

export function useFileCollector(): FileCollector {
  return useContext(FileCollectorContext)
}
