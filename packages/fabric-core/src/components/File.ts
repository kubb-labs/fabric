import { useFile } from '../composables/useFile.ts'
import { useFileManager } from '../composables/useFileManager.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { FileContext } from '../contexts/FileContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import type { KubbFile } from '../types.ts'
import { Text } from './Text.ts'

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
  /**
   * Children nodes.
   */
  children?: string | (() => string | Array<string>)
}

/**
 * Adds files to the FileManager
 */
export function File<TMeta extends object = object>({ children, ...props }: FileProps<TMeta>): string {
  const { baseName, path, meta = {}, footer, banner } = props

  const fileManager = useFileManager()
  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'File', props })

    provide(NodeTreeContext, childTree)
  }

  const file: KubbFile.File = {
    baseName,
    path,
    meta,
    banner,
    footer,
    sources: [],
    imports: [],
    exports: [],
  }

  const [resolvedFile] = fileManager.add(file)
  provide(FileContext, resolvedFile)

  return Text({ children })
}

type FileSourceProps = Omit<KubbFile.Source, 'value'> & {
  /**
   * Children nodes.
   */
  children?: string | (() => string | Array<string>)
}

/**
 * FileSource - for adding source code to a file
 *
 * Returns the provided children string so the fsx renderer can collect it.
 */
export function FileSource({ children, ...props }: FileSourceProps): string {
  const { name, isExportable, isIndexable, isTypeOnly } = props

  const nodeTree = useNodeTree()
  const file = useFile()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'FileSource', props })

    provide(NodeTreeContext, childTree)
  }

  if (file) {
    file.sources.push({
      name,
      isExportable,
      isIndexable,
      isTypeOnly,
      value: Text({ children }),
    })
  }

  return Text({ children })
}

export type FileExportProps = KubbFile.Export

/**
 * FileExport - for adding exports to a file
 *
 * No-op function used by renderers to record exports.
 */
export function FileExport(props: FileExportProps): string {
  const { name, path, isTypeOnly, asAlias } = props

  const nodeTree = useNodeTree()
  const file = useFile()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'FileExport', props })

    provide(NodeTreeContext, childTree)
  }

  if (file) {
    file.exports.push({
      name,
      path,
      asAlias,
      isTypeOnly,
    })
  }

  return Text({ children: '' })
}

export type FileImportProps = KubbFile.Import

/**
 * FileImport - for adding imports to a file
 *
 * No-op function used by renderers to record imports.
 */
export function FileImport(props: FileImportProps): string {
  const { name, path, root, isNameSpace, isTypeOnly } = props

  const nodeTree = useNodeTree()
  const file = useFile()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'FileImport', props })

    provide(NodeTreeContext, childTree)
  }

  if (file) {
    file.imports.push({
      name,
      path,
      root,
      isNameSpace,
      isTypeOnly,
    })
  }

  return Text({ children: '' })
}

File.Source = FileSource
File.Import = FileImport
File.Export = FileExport
