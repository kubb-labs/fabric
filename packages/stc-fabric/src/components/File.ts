import type { FileCollector } from '@kubb/fabric-core'
import type { KubbFile } from '@kubb/fabric-core/types'
import { createContext, inject } from '../context.ts'

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
}

/**
 * Context for collecting files - provided by createStcFabric
 */
export const FileCollectorContext = createContext<FileCollector | null>(null)

/**
 * File component for stc - registers files via context
 */
export function File<TMeta extends object = object>(props: FileProps<TMeta>): string {
  const collector = inject(FileCollectorContext, null)

  if (!collector) {
    // If no collector, just return empty string (fallback)
    return ''
  }
  // Register this file with the collector
  // Type assertion needed because FileCollector isn't exposed in types
  ;(collector as any).add({
    baseName: props.baseName,
    path: props.path,
    meta: props.meta || ({} as TMeta),
    banner: props.banner,
    footer: props.footer,
    sources: [],
    imports: [],
    exports: [],
  })

  return ''
}

/**
 * FileSource - for adding source code to a file
 */
export function FileSource(props: Omit<KubbFile.Source, 'value'> & { children?: string }): string {
  // TODO: Implement source tracking via context
  return props.children || ''
}

/**
 * FileExport - for adding exports to a file
 */
export function FileExport(_props: KubbFile.Export): string {
  // TODO: Implement export tracking via context
  return ''
}

/**
 * FileImport - for adding imports to a file
 */
export function FileImport(_props: KubbFile.Import): string {
  // TODO: Implement import tracking via context
  return ''
}

// Export namespace-style API similar to React version
export const FileNamespace = {
  Source: FileSource,
  Export: FileExport,
  Import: FileImport,
}
