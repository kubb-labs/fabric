import { createHash } from 'node:crypto'
import path from 'node:path'
import { orderBy } from 'natural-orderby'
import { uniqueBy } from 'remeda'
import type * as KubbFile from './KubbFile.ts'
import { trimExtName } from './utils/trimExtName.ts'

export function combineSources(sources: Array<KubbFile.Source>): Array<KubbFile.Source> {
  return uniqueBy(sources, (obj) => {
    // For named sources, deduplicate by name, isExportable, and isTypeOnly
    // For unnamed sources, include the value to avoid deduplicating different code blocks
    // If both name and value are undefined, use an empty string as the unique identifier
    const uniqueId = obj.name ?? obj.value ?? ''
    const isExportable = obj.isExportable ?? false
    const isTypeOnly = obj.isTypeOnly ?? false
    return `${uniqueId}:${isExportable}:${isTypeOnly}`
  })
}

export function combineExports(exports: Array<KubbFile.Export>): Array<KubbFile.Export> {
  const sorted = orderBy(exports, [
    (v) => !!Array.isArray(v.name),
    (v) => !v.isTypeOnly,
    (v) => v.path,
    (v) => !!v.name,
    (v) => (Array.isArray(v.name) ? orderBy(v.name) : v.name),
  ])

  const prev: Array<KubbFile.Export> = []
  // Map to track items by path for O(1) lookup
  const pathMap = new Map<string, KubbFile.Export>()
  // Map to track unique items by path+name+isTypeOnly+asAlias
  const uniqueMap = new Map<string, KubbFile.Export>()
  // Map to track items by path+name where isTypeOnly=true (for type-only check)
  const pathNameTypeTrueMap = new Map<string, KubbFile.Export>()

  for (const curr of sorted) {
    const name = curr.name
    const pathKey = curr.path
    const prevByPath = pathMap.get(pathKey)

    // Create unique key for path+name+isTypeOnly
    const nameKey = Array.isArray(name) ? JSON.stringify(name) : name || ''
    const pathNameTypeKey = `${pathKey}:${nameKey}:${curr.isTypeOnly}`
    // Check if there's already an item with the same path+name but with isTypeOnly=true
    const pathNameKey = `${pathKey}:${nameKey}`
    const prevByPathAndIsTypeOnly = pathNameTypeTrueMap.get(pathNameKey)

    if (prevByPathAndIsTypeOnly) {
      // we already have an export that has the same path and name but uses `isTypeOnly` (export type ...)
      continue
    }

    // Create unique key for path+name+isTypeOnly+asAlias
    const uniqueKey = `${pathNameTypeKey}:${curr.asAlias || ''}`
    const uniquePrev = uniqueMap.get(uniqueKey)

    // we already have an item that was unique enough or name field is empty or prev asAlias is set but current has no changes
    if (uniquePrev || (Array.isArray(name) && !name.length) || (prevByPath?.asAlias && !curr.asAlias)) {
      continue
    }

    if (!prevByPath) {
      const newItem = {
        ...curr,
        name: Array.isArray(name) ? [...new Set(name)] : name,
      }
      prev.push(newItem)
      pathMap.set(pathKey, newItem)
      uniqueMap.set(uniqueKey, newItem)
      // Track items with isTypeOnly=true for the type-only check
      if (newItem.isTypeOnly) {
        pathNameTypeTrueMap.set(pathNameKey, newItem)
      }
      continue
    }

    // merge all names when prev and current both have the same isTypeOnly set
    if (prevByPath && Array.isArray(prevByPath.name) && Array.isArray(curr.name) && prevByPath.isTypeOnly === curr.isTypeOnly) {
      prevByPath.name = [...new Set([...prevByPath.name, ...curr.name])]
      continue
    }

    prev.push(curr)
    uniqueMap.set(uniqueKey, curr)
    // Track items with isTypeOnly=true for the type-only check
    if (curr.isTypeOnly) {
      pathNameTypeTrueMap.set(pathNameKey, curr)
    }
  }

  return prev
}

export function combineImports(imports: Array<KubbFile.Import>, exports: Array<KubbFile.Export>, source?: string): Array<KubbFile.Import> {
  const exportedNameLookup = new Set<string>()
  for (const item of exports) {
    const { name } = item
    if (!name) {
      continue
    }

    if (Array.isArray(name)) {
      for (const value of name) {
        if (value) {
          exportedNameLookup.add(value)
        }
      }
      continue
    }

    exportedNameLookup.add(name)
  }

  const usageCache = new Map<string, boolean>()
  const hasImportInSource = (importName: string): boolean => {
    if (!source) {
      return true
    }

    const cached = usageCache.get(importName)
    if (cached !== undefined) {
      return cached
    }

    const isUsed = source.includes(importName) || exportedNameLookup.has(importName)
    usageCache.set(importName, isUsed)

    return isUsed
  }

  const sorted = orderBy(imports, [
    (v) => !!Array.isArray(v.name),
    (v) => !v.isTypeOnly,
    (v) => v.path,
    (v) => !!v.name,
    (v) => (Array.isArray(v.name) ? orderBy(v.name) : v.name),
  ])

  const prev: Array<KubbFile.Import> = []
  // Map to track items by path+isTypeOnly for O(1) lookup
  const pathTypeMap = new Map<string, KubbFile.Import>()
  // Map to track unique items by path+name+isTypeOnly
  const uniqueMap = new Map<string, KubbFile.Import>()
  // Map to track items by path+name where isTypeOnly=true (for type-only check)
  const pathNameTypeTrueMap = new Map<string, KubbFile.Import>()

  for (const curr of sorted) {
    let name = Array.isArray(curr.name) ? [...new Set(curr.name)] : curr.name

    if (curr.path === curr.root) {
      // root and path are the same file, remove the "./" import
      continue
    }

    // merge all names and check if the importName is being used in the generated source and if not filter those imports out
    if (Array.isArray(name)) {
      name = name.filter((item) => (typeof item === 'string' ? hasImportInSource(item) : hasImportInSource(item.propertyName)))
    }

    const pathTypeKey = `${curr.path}:${curr.isTypeOnly}`
    const prevByPath = pathTypeMap.get(pathTypeKey)

    // Create key for name comparison
    const nameKey = Array.isArray(name) ? JSON.stringify(name) : name || ''
    const pathNameTypeKey = `${curr.path}:${nameKey}:${curr.isTypeOnly}`
    const uniquePrev = uniqueMap.get(pathNameTypeKey)
    // Check if there's already an item with the same path+name but with isTypeOnly=true
    const pathNameKey = `${curr.path}:${nameKey}`
    const prevByPathNameAndIsTypeOnly = pathNameTypeTrueMap.get(pathNameKey)

    if (prevByPathNameAndIsTypeOnly) {
      // we already have an import that has the same path and name but uses `isTypeOnly` (import type ...)
      continue
    }

    // already unique enough or name is empty
    if (uniquePrev || (Array.isArray(name) && !name.length)) {
      continue
    }

    // new item, append name
    if (!prevByPath) {
      const newItem = {
        ...curr,
        name,
      }
      prev.push(newItem)
      pathTypeMap.set(pathTypeKey, newItem)
      uniqueMap.set(pathNameTypeKey, newItem)
      // Track items with isTypeOnly=true for the type-only check
      if (newItem.isTypeOnly) {
        pathNameTypeTrueMap.set(pathNameKey, newItem)
      }
      continue
    }

    // merge all names when prev and current both have the same isTypeOnly set
    if (prevByPath && Array.isArray(prevByPath.name) && Array.isArray(name) && prevByPath.isTypeOnly === curr.isTypeOnly) {
      prevByPath.name = [...new Set([...prevByPath.name, ...name])]
      continue
    }

    // no import was found in the source, ignore import
    if (!Array.isArray(name) && name && !hasImportInSource(name)) {
      continue
    }

    prev.push(curr)
    uniqueMap.set(pathNameTypeKey, curr)
    // Track items with isTypeOnly=true for the type-only check
    if (curr.isTypeOnly) {
      pathNameTypeTrueMap.set(pathNameKey, curr)
    }
  }

  return prev
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
    id: createHash('sha256').update(file.path).digest('hex'),
    name: trimExtName(file.baseName),
    extname,
    imports: imports,
    exports: exports,
    sources: sources,
    meta: file.meta || ({} as TMeta),
  }
}
