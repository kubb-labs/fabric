import { FileContext, NodeTreeContext, provide, useFileCollector, useNodeTree } from '@kubb/fabric-core'
import type { KubbFile } from '@kubb/fabric-core/types'
import type { Key, KubbNode } from '../types.ts'

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
  children?: KubbNode
}

/**
 * Registers a file in the FileCollector context and provides a scoped collector
 * for children. When `baseName` and `path` are provided the file will be
 * registered so it can be emitted by the collector later.
 */
export function File<TMeta extends object = object>({ children, ...props }: Props<TMeta>) {
  const { baseName, path, meta = {}, footer, banner } = props

  const fileCollector = useFileCollector()
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

  fileCollector.add(file)
  provide(FileContext, file)

  return <kubb-file {...props}>{children}</kubb-file>
}

File.displayName = 'KubbFile'

type FileSourceProps = Omit<KubbFile.Source, 'value'> & {
  key?: Key
  children?: KubbNode
}

/**
 * File.Source
 *
 * Marks a block of source text to be associated with the current file when
 * rendering with the FileCollector. Children are treated as the source string.
 */
function FileSource({ isTypeOnly, name, isExportable, isIndexable, children }: FileSourceProps) {
  return (
    <kubb-source name={name} isTypeOnly={isTypeOnly} isExportable={isExportable} isIndexable={isIndexable}>
      {children}
    </kubb-source>
  )
}

FileSource.displayName = 'KubbFileSource'

type FileExportProps = KubbFile.Export & { key?: Key }

/**
 * File.Export
 *
 * Declares an export entry for the current file. This will be collected by
 * the FileCollector for later emission.
 */
function FileExport({ name, path, isTypeOnly, asAlias }: FileExportProps) {
  return <kubb-export name={name} path={path} isTypeOnly={isTypeOnly || false} asAlias={asAlias} />
}

FileExport.displayName = 'KubbFileExport'

type FileImportProps = KubbFile.Import & { key?: Key }

/**
 * File.Import
 *
 * Declares an import entry for the current file.
 */
function FileImport({ name, root, path, isTypeOnly, isNameSpace }: FileImportProps) {
  return <kubb-import name={name} root={root} path={path} isNameSpace={isNameSpace} isTypeOnly={isTypeOnly || false} />
}

FileImport.displayName = 'KubbFileImport'

File.Export = FileExport
File.Import = FileImport
File.Source = FileSource
