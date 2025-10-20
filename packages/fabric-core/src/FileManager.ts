import pLimit from 'p-limit'

import type * as KubbFile from './types.ts'
import { parseFile } from './parsers/parser.ts'
import { Cache } from './utils/Cache.ts'
import { trimExtName, write } from './fs.ts'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { orderBy } from 'natural-orderby'
import { isDeepEqual, uniqueBy } from 'remeda'

type WriteFilesProps = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

export class FileManager {
  #cache = new Cache<KubbFile.ResolvedFile>()
  #limit = pLimit(100)

  constructor() {
    return this
  }

  async add(...files: Array<KubbFile.File>) {
    const resolvedFiles: Array<KubbFile.ResolvedFile> = []

    const mergedFiles = new Map<string, KubbFile.File>()

    files.forEach((file) => {
      const existing = mergedFiles.get(file.path)
      if (existing) {
        mergedFiles.set(file.path, mergeFile(existing, file))
      } else {
        mergedFiles.set(file.path, file)
      }
    })

    for (const file of mergedFiles.values()) {
      const existing = this.#cache.get(file.path)

      const merged = existing ? mergeFile(existing, file) : file
      const resolvedFile = createFile(merged)

      this.#cache.set(resolvedFile.path, resolvedFile)
      this.flush()

      resolvedFiles.push(resolvedFile)
    }

    return resolvedFiles
  }

  flush() {
    this.#cache.flush()
  }

  getByPath(path: KubbFile.Path): KubbFile.ResolvedFile | null {
    return this.#cache.get(path)
  }

  deleteByPath(path: KubbFile.Path): void {
    this.#cache.delete(path)
  }

  clear(): void {
    this.#cache.clear()
  }

  getFiles(): Array<KubbFile.ResolvedFile> {
    const cachedKeys = this.#cache.keys()

    // order by path length and if file is a barrel file
    const keys = orderBy(cachedKeys, [(v) => v.length, (v) => trimExtName(v).endsWith('index')])

    const files = keys.map((key) => this.#cache.get(key))

    return files.filter(Boolean)
  }

  async processFiles({ dryRun, extension }: WriteFilesProps): Promise<Array<KubbFile.ResolvedFile>> {
    const files = this.getFiles()

    const promises = files.map((resolvedFile) => {
      return this.#limit(async () => {
        const extname = extension ? extension[resolvedFile.extname] || undefined : resolvedFile.extname

        if (!dryRun) {
          const source = await parseFile(resolvedFile, { extname })

          await write(resolvedFile.path, source, { sanity: false })
        }
      })
    })

    await Promise.all(promises)

    return files
  }
}

function hashObject(obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  return createHash('sha256').update(str).digest('hex')
}

export function mergeFile<TMeta extends object = object>(a: KubbFile.File<TMeta>, b: KubbFile.File<TMeta>): KubbFile.File<TMeta> {
  return {
    ...a,
    sources: [...(a.sources || []), ...(b.sources || [])],
    imports: [...(a.imports || []), ...(b.imports || [])],
    exports: [...(a.exports || []), ...(b.exports || [])],
  }
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
