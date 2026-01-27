import { FileContext, NodeTreeContext, provide, useFile, useFileManager, useNodeTree } from '@kubb/fabric-core'
import type { KubbFile } from '@kubb/fabric-core/types'
import type { FabricReactElement, FabricReactNode, Key } from '../types.ts'

type BasePropsWithBaseName = {
  /**
   * Name to be used to dynamicly create the baseName(based on input.path).
   * Based on UNIX basename
   * @link https://nodejs.org/api/path.html#pathbasenamepath-suffix
   */
  baseName: KubbFile.BaseName
  /**
   * Path will be full qualified path to a specified file.
   */
  path: KubbFile.Path
}

type BasePropsWithoutBaseName = {
  baseName?: never
  /**
   * Path will be full qualified path to a specified file.
   */
  path?: KubbFile.Path
}

type BaseProps = BasePropsWithBaseName | BasePropsWithoutBaseName

type Props<TMeta> = BaseProps & {
  key?: Key
  meta?: TMeta
  banner?: string
  footer?: string
  children?: FabricReactNode
}

/**
 * Adds files to the FileManager
 */
export function File<TMeta extends object = object>({ children, ...props }: Props<TMeta>): FabricReactElement {
  const { baseName, path, meta = {}, footer, banner } = props

  const fileManager = useFileManager()
  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'File', props })

    provide(NodeTreeContext, childTree)
  }

  if (!baseName || !path) {
    return <>{children}</>
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

  return <kubb-file {...props}>{children}</kubb-file>
}

File.displayName = 'File'

type FileSourceProps = Omit<KubbFile.Source, 'value'> & {
  key?: Key
  children?: FabricReactNode
}

/**
 * File.Source
 *
 * Marks a block of source text to be associated with the current file when
 * rendering with the FileCollector. Children are treated as the source string.
 */
function FileSource({ children, ...props }: FileSourceProps): FabricReactElement {
  const { name, isExportable, isIndexable, isTypeOnly } = props

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'FileSource', props })

    provide(NodeTreeContext, childTree)
  }

  return (
    <kubb-source name={name} isTypeOnly={isTypeOnly} isExportable={isExportable} isIndexable={isIndexable}>
      {children}
    </kubb-source>
  )
}

FileSource.displayName = 'FileSource'

export type FileExportProps = KubbFile.Export & { key?: Key }

/**
 * File.Export
 *
 * Declares an export entry for the current file. This will be collected by
 * the FileCollector for later emission.
 */
function FileExport(props: FileExportProps): FabricReactElement {
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

  return <kubb-export name={name} path={path} isTypeOnly={isTypeOnly} asAlias={asAlias} />
}

FileExport.displayName = 'FileExport'

export type FileImportProps = KubbFile.Import & { key?: Key }

/**
 * File.Import
 *
 * Declares an import entry for the current file.
 */
function FileImport(props: FileImportProps): FabricReactElement {
  const { name, root, path, isTypeOnly, isNameSpace } = props

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

  return <kubb-import name={name} root={root} path={path} isNameSpace={isNameSpace} isTypeOnly={isTypeOnly} />
}

FileImport.displayName = 'FileImport'

File.Export = FileExport
File.Import = FileImport
File.Source = FileSource
