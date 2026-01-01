import type { FileCollector } from '@kubb/fabric-core'
import type { KubbFile } from '@kubb/fabric-core/types'
import { createContext, useContext as useReactContext, useEffect } from 'react'
import type { Key, KubbNode } from '../types.ts'

export type FileContextProps<TMeta extends object = object> = {
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
  meta?: TMeta
}
const FileContext = createContext<FileContextProps>({} as FileContextProps)

/**
 * Context for collecting files - provided by the Runtime
 */
export const FileCollectorContext = createContext<FileCollector | null>(null)

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

export function File<TMeta extends object = object>({ children, ...rest }: Props<TMeta>) {
  const collector = useReactContext(FileCollectorContext)

  useEffect(() => {
    if (!rest.baseName || !rest.path || !collector) {
      return
    }

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
  }, [collector, rest.baseName, rest.path, rest.meta, rest.banner, rest.footer])

  if (!rest.baseName || !rest.path) {
    return <>{children}</>
  }

  return (
    <kubb-file {...rest}>
      <FileContext.Provider value={{ baseName: rest.baseName, path: rest.path, meta: rest.meta }}>{children}</FileContext.Provider>
    </kubb-file>
  )
}

File.displayName = 'KubbFile'

type FileSourceProps = Omit<KubbFile.Source, 'value'> & {
  key?: Key
  children?: KubbNode
}

function FileSource({ isTypeOnly, name, isExportable, isIndexable, children }: FileSourceProps) {
  return (
    <kubb-source name={name} isTypeOnly={isTypeOnly} isExportable={isExportable} isIndexable={isIndexable}>
      {children}
    </kubb-source>
  )
}

FileSource.displayName = 'KubbFileSource'

type FileExportProps = KubbFile.Export & { key?: Key }

function FileExport({ name, path, isTypeOnly, asAlias }: FileExportProps) {
  return <kubb-export name={name} path={path} isTypeOnly={isTypeOnly || false} asAlias={asAlias} />
}

FileExport.displayName = 'KubbFileExport'

type FileImportProps = KubbFile.Import & { key?: Key }

function FileImport({ name, root, path, isTypeOnly, isNameSpace }: FileImportProps) {
  return <kubb-import name={name} root={root} path={path} isNameSpace={isNameSpace} isTypeOnly={isTypeOnly || false} />
}

FileImport.displayName = 'KubbFileImport'

File.Export = FileExport
File.Import = FileImport
File.Source = FileSource
File.Context = FileContext
