import type { FileCollector } from '../FileCollector.ts'
import type { KubbFile } from '../types.ts'
import { createContext, inject, provide, unprovide } from '../context.ts'

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
 * Context for collecting files - provided by createStcFabric
 */
export const FileCollectorContext = createContext<FileCollector | null>(null)

/**
 * Context for the current file being processed
 */
type TreeNode = {
  type: string
  props?: Record<string, any>
  children?: TreeNode[]
}

type CurrentFileContext = {
  sources: KubbFile.Source[]
  imports: KubbFile.Import[]
  exports: KubbFile.Export[]
  tree: TreeNode[]
  treeStack: TreeNode[][]
}
export const CurrentFileContext = createContext<CurrentFileContext | null>(null)

/**
 * File component for stc - registers files via context
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
    tree: [],
    treeStack: [],
  }

  // Provide the current file context
  provide(CurrentFileContext, currentFile)

  // Process children (which may call FileSource, FileImport, FileExport)
  const result = props.children || ''

  // Clean up context
  unprovide(CurrentFileContext)

  // Add stringified tree as a special source for viewing/filtering
  const treeSource: KubbFile.Source = {
    name: '__tree__',
    value: JSON.stringify(currentFile.tree, null, 2),
    isTypeOnly: false,
    isExportable: false,
    isIndexable: false,
  }

  // Register this file with the collector
  // Type assertion needed because FileCollector isn't exposed in types
  ;(collector as any).add({
    baseName: props.baseName,
    path: props.path,
    meta: props.meta || ({} as TMeta),
    banner: props.banner,
    footer: props.footer,
    sources: [...currentFile.sources, treeSource],
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
    // Add to sources
    currentFile.sources.push({
      name: props.name,
      isTypeOnly: props.isTypeOnly,
      isExportable: props.isExportable,
      isIndexable: props.isIndexable,
      value: props.children || '',
    })

    // Track in tree
    const node: TreeNode = {
      type: 'FileSource',
      props: {
        name: props.name,
        isTypeOnly: props.isTypeOnly,
        isExportable: props.isExportable,
        isIndexable: props.isIndexable,
      },
    }

    // Add to current tree level
    const currentLevel = currentFile.treeStack.length > 0 
      ? currentFile.treeStack[currentFile.treeStack.length - 1]
      : currentFile.tree
    
    currentLevel.push(node)
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

    // Track in tree
    const node: TreeNode = {
      type: 'FileExport',
      props: {
        name: props.name,
        path: props.path,
        isTypeOnly: props.isTypeOnly,
        asAlias: props.asAlias,
      },
    }

    // Add to current tree level
    const currentLevel = currentFile.treeStack.length > 0 
      ? currentFile.treeStack[currentFile.treeStack.length - 1]
      : currentFile.tree
    
    currentLevel.push(node)
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

    // Track in tree
    const node: TreeNode = {
      type: 'FileImport',
      props: {
        name: props.name,
        root: props.root,
        path: props.path,
        isNameSpace: props.isNameSpace,
        isTypeOnly: props.isTypeOnly,
      },
    }

    // Add to current tree level
    const currentLevel = currentFile.treeStack.length > 0 
      ? currentFile.treeStack[currentFile.treeStack.length - 1]
      : currentFile.tree
    
    currentLevel.push(node)
  }

  return ''
}

// Export namespace-style API similar to React version
export const FileNamespace = {
  Source: FileSource,
  Export: FileExport,
  Import: FileImport,
}
