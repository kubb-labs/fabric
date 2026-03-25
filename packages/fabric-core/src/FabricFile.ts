type ImportName =
  | string
  | Array<
      | string
      | {
          propertyName: string
          name?: string
        }
    >

export type Import = {
  /**
   * Import name to be used
   * @example ["useState"]
   * @example "React"
   */
  name: ImportName

  /**
   * Path for the import
   * @example '@kubb/core'
   */
  path: string
  /**
   * Add type-only import prefix.
   * - `true` generates `import type { Type } from './path'`
   * - `false` generates `import { Type } from './path'`
   * @default false
   */
  isTypeOnly?: boolean

  /**
   * Import entire module as namespace.
   * - `true` generates `import * as Name from './path'`
   * - `false` generates standard import
   * @default false
   */
  isNameSpace?: boolean
  /**
   * When root is set it will get the path with relative getRelativePath(root, path).
   */
  root?: string
}

export type Source = {
  name?: string
  value?: string
  /**
   * Make this source a type-only export.
   * - `true` marks source as type export
   * - `false` marks source as value export
   * @default false
   */
  isTypeOnly?: boolean
  /**
   * Include export keyword in source.
   * - `true` generates exportable const or type
   * - `false` generates internal declaration
   * @default false
   */
  isExportable?: boolean
  /**
   * Include in barrel file generation.
   * - `true` adds to barrel exports
   * - `false` excludes from barrel exports
   * @default false
   */
  isIndexable?: boolean
}

export type Export = {
  /**
   * Export name to be used.
   * @example ["useState"]
   * @example "React"
   */
  name?: string | Array<string>
  /**
   * Path for the import.
   * @example '@kubb/core'
   */
  path: string
  /**
   * Add type-only export prefix.
   * - `true` generates `export type { Type } from './path'`
   * - `false` generates `export { Type } from './path'`
   * @default false
   */
  isTypeOnly?: boolean
  /**
   * Export as aliased namespace.
   * - `true` generates `export * as aliasName from './path'`
   * - `false` generates standard export
   * @default false
   */
  asAlias?: boolean
}

export type Extname = '.ts' | '.js' | '.tsx' | '.json' | `.${string}`

export type Mode = 'single' | 'split'

/**
 * Name to be used to dynamically create the baseName(based on input.path)
 * Based on UNIX basename
 * @link https://nodejs.org/api/path.html#pathbasenamepath-suffix
 */
export type BaseName = `${string}.${string}`

/**
 * Path will be full qualified path to a specified file
 */
export type Path = string

export type File<TMeta extends object = object> = {
  /**
   * Name to be used to create the path
   * Based on UNIX basename, `${name}.extname`
   * @link https://nodejs.org/api/path.html#pathbasenamepath-suffix
   */
  baseName: BaseName
  /**
   * Path will be full qualified path to a specified file
   */
  path: Path
  sources: Array<Source>
  imports: Array<Import>
  exports: Array<Export>
  /**
   * Use extra meta, this is getting used to generate the barrel/index files.
   */
  meta?: TMeta
  banner?: string
  footer?: string
}

export type ResolvedFile<TMeta extends object = object> = File<TMeta> & {
  /**
   * @default hash
   */
  id: string
  /**
   * Contains the first part of the baseName, generated based on baseName
   * @link  https://nodejs.org/api/path.html#pathformatpathobject
   */
  name: string
  extname: Extname
  imports: Array<Import>
  exports: Array<Export>
}
