import { useContext } from 'react'

import { File } from '../components/File.tsx'

import type { FileContextProps } from '../components/File.tsx'

/**
 * `useFile` will return the current file when <File/> is used.
 */
export function useFile(): FileContextProps {
  const file = useContext(File.Context)

  return file as FileContextProps
}
