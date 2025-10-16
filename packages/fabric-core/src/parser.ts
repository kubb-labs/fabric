import { createHash } from 'node:crypto'
import path from 'node:path'
import { orderBy } from 'natural-orderby'
import { isDeepEqual, uniqueBy } from 'remeda'
import { trimExtName } from './fs.ts'
import type * as KubbFile from './types.ts'
import type { ResolvedFile } from './types.ts'
import { typeScriptParser } from './parsers/typescript.ts'
import { tsxParser } from './parsers/tsx.ts'

function hashObject(obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  return createHash('sha256').update(str).digest('hex')
}

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
    id: hashObject({ path: file.path }),
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
