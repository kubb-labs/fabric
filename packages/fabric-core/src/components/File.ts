import { createContext, inject, provide, unprovide } from '../context.ts'
import type { FileCollector } from '../FileCollector.ts'
import type { KubbFile } from '../types.ts'

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

/**
 * File component for fsx - registers files via context
 */
export function File<TMeta extends object = object>(props: FileProps<TMeta>): string {
  const collector = inject(FileCollectorContext, null)

  if (!collector) {
    // If no collector, just return children (fallback)
    return props.children || ''
  }

  // Create a context for tracking sources/imports/exports for this file
  const currentFile: CurrentFileContext = {
    sources: [],
    imports: [],
    exports: [],
  }

  // Provide the current file context
  provide(CurrentFileContext, currentFile)

  // Process children (which may call FileSource, FileImport, FileExport)
  const result = props.children || ''

  // Clean up context
  unprovide(CurrentFileContext)

  // Register this file with the collector
  // Type assertion needed because FileCollector isn't exposed in types
  ;(collector as any).add({
    baseName: props.baseName,
    path: props.path,
    meta: props.meta || ({} as TMeta),
    banner: props.banner,
    footer: props.footer,
    sources: currentFile.sources,
    imports: currentFile.imports,
    exports: currentFile.exports,
  })

  return result
}

/**
 * FileSource - for adding source code to a file
 */
export function FileSource(props: Omit<KubbFile.Source, 'value'> & { children?: string }): string {
  const currentFile = inject(CurrentFileContext, null)

  if (currentFile) {
    // Create tree node for this source
    const treeNode: KubbFile.TreeNode = {
      type: 'FileSource',
      props: {
        name: props.name,
        isTypeOnly: props.isTypeOnly,
        isExportable: props.isExportable,
        isIndexable: props.isIndexable,
      },
    }

    // Add to sources with tree node attached
    currentFile.sources.push({
      name: props.name,
      isTypeOnly: props.isTypeOnly,
      isExportable: props.isExportable,
      isIndexable: props.isIndexable,
      value: props.children || '',
      tree: treeNode,
    })
  }

  return props.children || ''
}

/**
 * FileExport - for adding exports to a file
 */
export function FileExport(props: KubbFile.Export): string {
  const currentFile = inject(CurrentFileContext, null)

  if (currentFile) {
    // Add to exports
    currentFile.exports.push({
      name: props.name,
      path: props.path,
      isTypeOnly: props.isTypeOnly || false,
      asAlias: props.asAlias,
    })
  }

  return ''
}

/**
 * FileImport - for adding imports to a file
 */
export function FileImport(props: KubbFile.Import): string {
  const currentFile = inject(CurrentFileContext, null)

  if (currentFile) {
    // Add to imports
    currentFile.imports.push({
      name: props.name,
      root: props.root,
      path: props.path,
      isNameSpace: props.isNameSpace,
      isTypeOnly: props.isTypeOnly || false,
    })
  }

  return ''
}

// Export namespace-style API similar to React version
export const FileNamespace = {
  Source: FileSource,
  Export: FileExport,
  Import: FileImport,
}
