import { useContext } from '../composables/useContext.ts'
import { provide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import type { KubbFile } from '../types.ts'
import { FileCollector } from '../utils/FileCollector.ts'

export type FileProps<TMeta extends object = object> = {
  /**
   * Name to be used to dynamically create the baseName(based on input.path).
   * Based on UNIX basename
   * @link https://nodejs.org/api/path.html#pathbasenamepath-suffix
   */
  baseName: KubbFile.BaseName
  /**
   * Path will be full qualified path to a specified file.
   */
  path: KubbFile.Path
  meta?: TMeta
  banner?: string
  footer?: string
  children?: string
}

/**
 * File component for fsx - registers files via context
 */
export function File<TMeta extends object = object>({ children, ...rest }: FileProps<TMeta>): string {
  const collector = useContext(FileCollectorContext, new FileCollector())
  provide(FileCollectorContext, collector)

  // Register this file with the collector
  collector.add({
    baseName: rest.baseName,
    path: rest.path,
    meta: rest.meta || ({} as TMeta),
    banner: rest.banner,
    footer: rest.footer,
    sources: [],
    imports: [],
    exports: [],
  })

  return children || ''
}

/**
 * FileSource - for adding source code to a file
 */
export function FileSource(props: Omit<KubbFile.Source, 'value'> & { children?: string }): string {
  return props.children || ''
}

/**
 * FileExport - for adding exports to a file
 */
export function FileExport(_props: KubbFile.Export): string {
  return ''
}

/**
 * FileImport - for adding imports to a file
 */
export function FileImport(_props: KubbFile.Import): string {
  return ''
}

File.Source = FileSource
File.Import = FileImport
File.Export = FileExport
