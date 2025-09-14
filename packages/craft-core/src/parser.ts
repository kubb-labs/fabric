import path from 'node:path'
import { orderBy } from 'natural-orderby'
import hash from 'object-hash'
import { isDeepEqual, uniqueBy } from 'remeda'
import * as factory from './factory.ts'
import { print } from './print.ts'
import type * as KubbFile from './types.ts'
import type { ResolvedFile } from './types.ts'
import { getRelativePath, trimExtName } from './utils.ts'

export function combineSources(sources: Array<KubbFile.Source>): Array<KubbFile.Source> {
  return uniqueBy(sources, (obj) => [obj.name, obj.isExportable, obj.isTypeOnly] as const)
}

export function combineExports(exports: Array<KubbFile.Export>): Array<KubbFile.Export> {
  return orderBy(exports, [
    (v) => !!Array.isArray(v.name),
    (v) => !v.isTypeOnly,
    (v) => v.path,
    (v) => !!v.name,
    (v) => (Array.isArray(v.name) ? orderBy(v.name) : v.name),
  ]).reduce(
    (prev, curr) => {
      const name = curr.name
      const prevByPath = prev.findLast((imp) => imp.path === curr.path)
      const prevByPathAndIsTypeOnly = prev.findLast((imp) => imp.path === curr.path && isDeepEqual(imp.name, name) && imp.isTypeOnly)

      if (prevByPathAndIsTypeOnly) {
        // we already have an export that has the same path but uses `isTypeOnly` (export type ...)
        return prev
      }

      const uniquePrev = prev.findLast(
        (imp) => imp.path === curr.path && isDeepEqual(imp.name, name) && imp.isTypeOnly === curr.isTypeOnly && imp.asAlias === curr.asAlias,
      )

      // we already have an item that was unique enough or name field is empty or prev asAlias is set but current has no changes
      if (uniquePrev || (Array.isArray(name) && !name.length) || (prevByPath?.asAlias && !curr.asAlias)) {
        return prev
      }

      if (!prevByPath) {
        return [
          ...prev,
          {
            ...curr,
            name: Array.isArray(name) ? [...new Set(name)] : name,
          },
        ]
      }

      // merge all names when prev and current both have the same isTypeOnly set
      if (prevByPath && Array.isArray(prevByPath.name) && Array.isArray(curr.name) && prevByPath.isTypeOnly === curr.isTypeOnly) {
        prevByPath.name = [...new Set([...prevByPath.name, ...curr.name])]

        return prev
      }

      return [...prev, curr]
    },
    [] as Array<KubbFile.Export>,
  )
}

export function combineImports(imports: Array<KubbFile.Import>, exports: Array<KubbFile.Export>, source?: string): Array<KubbFile.Import> {
  return orderBy(imports, [
    (v) => !!Array.isArray(v.name),
    (v) => !v.isTypeOnly,
    (v) => v.path,
    (v) => !!v.name,
    (v) => (Array.isArray(v.name) ? orderBy(v.name) : v.name),
  ]).reduce(
    (prev, curr) => {
      let name = Array.isArray(curr.name) ? [...new Set(curr.name)] : curr.name

      const hasImportInSource = (importName: string) => {
        if (!source) {
          return true
        }

        const checker = (name?: string) => {
          return name && source.includes(name)
        }

        return checker(importName) || exports.some(({ name }) => (Array.isArray(name) ? name.some(checker) : checker(name)))
      }

      if (curr.path === curr.root) {
        // root and path are the same file, remove the "./" import
        return prev
      }

      // merge all names and check if the importName is being used in the generated source and if not filter those imports out
      if (Array.isArray(name)) {
        name = name.filter((item) => (typeof item === 'string' ? hasImportInSource(item) : hasImportInSource(item.propertyName)))
      }

      const prevByPath = prev.findLast((imp) => imp.path === curr.path && imp.isTypeOnly === curr.isTypeOnly)
      const uniquePrev = prev.findLast((imp) => imp.path === curr.path && isDeepEqual(imp.name, name) && imp.isTypeOnly === curr.isTypeOnly)
      const prevByPathNameAndIsTypeOnly = prev.findLast((imp) => imp.path === curr.path && isDeepEqual(imp.name, name) && imp.isTypeOnly)

      if (prevByPathNameAndIsTypeOnly) {
        // we already have an export that has the same path but uses `isTypeOnly` (import type ...)
        return prev
      }

      // already unique enough or name is empty
      if (uniquePrev || (Array.isArray(name) && !name.length)) {
        return prev
      }

      // new item, append name
      if (!prevByPath) {
        return [
          ...prev,
          {
            ...curr,
            name,
          },
        ]
      }

      // merge all names when prev and current both have the same isTypeOnly set
      if (prevByPath && Array.isArray(prevByPath.name) && Array.isArray(name) && prevByPath.isTypeOnly === curr.isTypeOnly) {
        prevByPath.name = [...new Set([...prevByPath.name, ...name])]

        return prev
      }

      // no import was found in the source, ignore import
      if (!Array.isArray(name) && name && !hasImportInSource(name)) {
        return prev
      }

      return [...prev, curr]
    },
    [] as Array<KubbFile.Import>,
  )
}

/**
 * Helper to create a file with name and id set
 */
export function createFile<TMeta extends object = object>(file: KubbFile.File<TMeta>): KubbFile.ResolvedFile<TMeta> {
  const extname = path.extname(file.baseName) as KubbFile.Extname
  if (!extname) {
    throw new Error(`No extname found for ${file.baseName}`)
  }

  const source = file.sources.map((item) => item.value).join('\n\n')
  const exports = file.exports?.length ? combineExports(file.exports) : []
  const imports = file.imports?.length && source ? combineImports(file.imports, exports, source) : []
  const sources = file.sources?.length ? combineSources(file.sources) : []

  return {
    ...file,
    id: hash({ path: file.path }),
    name: trimExtName(file.baseName),
    extname,
    imports: imports,
    exports: exports,
    sources: sources,
    meta: file.meta || ({} as TMeta),
  }
}

export type ParserModule<TMeta extends object = object> = {
  /**
   * Convert a file to string
   */
  print: (file: KubbFile.ResolvedFile<TMeta>, options: PrintOptions) => Promise<string>
}

export function createFileParser<TMeta extends object = object>(parser: ParserModule<TMeta>): ParserModule<TMeta> {
  return parser
}

type PrintOptions = {
  extname?: KubbFile.Extname
}

const typeScriptParser = createFileParser({
  async print(file, options = { extname: '.ts' }) {
    const source = file.sources.map((item) => item.value).join('\n\n')

    const importNodes = file.imports
      .map((item) => {
        const importPath = item.root ? getRelativePath(item.root, item.path) : item.path
        const hasExtname = !!path.extname(importPath)

        return factory.createImportDeclaration({
          name: item.name,
          path: options.extname && hasExtname ? `${trimExtName(importPath)}${options.extname}` : item.root ? trimExtName(importPath) : importPath,
          isTypeOnly: item.isTypeOnly,
        })
      })
      .filter(Boolean)

    const exportNodes = file.exports
      .map((item) => {
        const exportPath = item.path

        const hasExtname = !!path.extname(exportPath)

        return factory.createExportDeclaration({
          name: item.name,
          path: options.extname && hasExtname ? `${trimExtName(item.path)}${options.extname}` : trimExtName(item.path),
          isTypeOnly: item.isTypeOnly,
          asAlias: item.asAlias,
        })
      })
      .filter(Boolean)

    return [file.banner, print([...importNodes, ...exportNodes]), source, file.footer].join('\n')
  },
})

const tsxParser = createFileParser({
  async print(file, options = { extname: '.tsx' }) {
    return typeScriptParser.print(file, options)
  },
})

const defaultParser = createFileParser({
  async print(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})

const parsers: Record<KubbFile.Extname, ParserModule<any>> = {
  '.ts': typeScriptParser,
  '.js': typeScriptParser,
  '.jsx': tsxParser,
  '.tsx': tsxParser,
  '.json': defaultParser,
}

type GetSourceOptions = {
  extname?: KubbFile.Extname
}

export async function parseFile(file: ResolvedFile, { extname }: GetSourceOptions = {}): Promise<string> {
  async function getFileParser<TMeta extends object = object>(extname: KubbFile.Extname | undefined): Promise<ParserModule<TMeta>> {
    if (!extname) {
      return defaultParser
    }

    const parser = parsers[extname]

    if (!parser) {
      console.warn(`[parser] No parser found for ${extname}, default parser will be used`)
    }

    return parser || defaultParser
  }

  const parser = await getFileParser(file.extname)

  return parser.print(file, { extname })
}
