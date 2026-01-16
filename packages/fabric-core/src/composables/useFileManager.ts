import { RootContext } from '../contexts/RootContext.ts'
import type { FileManager } from '../FileManager.ts'
import { useContext } from './useContext.ts'

export function useFileManager(): FileManager {
  const { fileManager } = useContext(RootContext)

  return fileManager
}
