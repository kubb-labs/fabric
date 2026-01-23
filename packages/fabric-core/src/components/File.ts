import { useFile } from '../composables/useFile.ts'
import { useFileManager } from '../composables/useFileManager.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { FileContext } from '../contexts/FileContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { type ComponentBuilder, createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import { renderIntrinsic } from '../intrinsic.ts'
import { createExport, createImport, print } from '../parsers/typescriptParser.ts'
import type { KubbFile } from '../types.ts'

export type FileProps<TMeta extends object = object> = {
  /**
   * File name with extension.
   *
   * @example 'user.ts'
   */
  baseName: KubbFile.BaseName
  /**
   * Full path to the file including directory and file name.
   *
   * The path must include the baseName at the end.
   *
   * @example './generated/types/user.ts'
   */
  path: KubbFile.Path
  /**
   * Optional metadata attached to the file.
   *
   * Use this to store custom information about the file.
   */
  meta?: TMeta
  /**
   * Optional banner text added at the top of the file.
   */
  banner?: string
  /**
   * Optional footer text added at the bottom of the file.
   */
  footer?: string
  /**
   * Child components (File.Source, File.Import, File.Export).
   */
  children?: FabricNode
}

/**
 * Component for generating files with sources, imports, and exports.
 *
 * Creates files in the FileManager that can be written to disk.
 *
 * @example
 * ```tsx
 * <File baseName="user.ts" path="./generated/user.ts">
 *   <File.Source isExportable>
 *     export type User = {{ '{' }} id: number {{ '}' }}
 *   </File.Source>
 * </File>
 * ```
 */
export const File = createComponent('File', ({ children, ...props }: FileProps) => {
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

  return children
}) as ComponentBuilder<FileProps<object>> & { Source: typeof FileSource; Import: typeof FileImport; Export: typeof FileExport }

type FileSourceProps = Omit<KubbFile.Source, 'value'> & {
  /**
   * Source code content.
   */
  children?: FabricNode
}

/**
 * Adds source code to a file.
 *
 * Use this component inside a File component to add code blocks.
 *
 * @example
 * ```tsx
 * <File.Source isExportable name="User">
 *   export type User = {{ '{' }} id: number {{ '}' }}
 * </File.Source>
 * ```
 */
export const FileSource = createComponent('FileSource', ({ children, ...props }: FileSourceProps) => {
  const { name, isExportable, isIndexable, isTypeOnly } = props

  const nodeTree = useNodeTree()
  const file = useFile()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'FileSource', props })

    provide(NodeTreeContext, childTree)
  }

  const value = renderIntrinsic(children)

  if (file) {
    file.sources.push({
      name,
      isExportable,
      isIndexable,
      isTypeOnly,
      value,
    })
  }

  return value
})

export type FileExportProps = KubbFile.Export

/**
 * Adds export statements to a file.
 *
 * Use this component to create re-exports from other files.
 *
 * @example
 * ```tsx
 * <File.Export name="User" path="./types/user" isTypeOnly />
 * ```
 */
export const FileExport = createComponent('FileExport', (props: FileExportProps) => {
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

  return print(createExport({ name, path, isTypeOnly, asAlias }))
})

export type FileImportProps = KubbFile.Import

/**
 * Adds import statements to a file.
 *
 * Use this component to import types or values from other files.
 *
 * @example
 * ```tsx
 * <File.Import name="User" path="./types/user" isTypeOnly />
 * ```
 */
export const FileImport = createComponent('FileImport', (props: FileImportProps) => {
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

  return print(createImport({ name, path, root, isNameSpace, isTypeOnly }))
})

File.Source = FileSource
File.Import = FileImport
File.Export = FileExport
