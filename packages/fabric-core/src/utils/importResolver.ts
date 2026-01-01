import type * as KubbFile from '../KubbFile.ts'
import type { RefKey } from './refkey.ts'
import { isRefKey } from './refkey.ts'

/**
 * Registry to track all refkeys and their definitions across files
 */
export class RefKeyRegistry {
  // Map of refkey ID to its definition (file path and symbol name)
  private definitions = new Map<
    string,
    {
      name: string
      path: string
      isTypeOnly?: boolean
    }
  >()

  /**
   * Register a refkey definition from a source
   */
  registerFromSource(source: KubbFile.Source, filePath: string): void {
    if (!source.refkey || !source.name) return

    this.definitions.set(source.refkey.id, {
      name: source.name,
      path: filePath,
      isTypeOnly: source.isTypeOnly,
    })
  }

  /**
   * Get the definition for a refkey
   */
  getDefinition(refkeyId: string): { name: string; path: string; isTypeOnly?: boolean } | undefined {
    return this.definitions.get(refkeyId)
  }

  /**
   * Clear all registered definitions
   */
  clear(): void {
    this.definitions.clear()
  }
}

/**
 * Scan source code for refkey usage and extract refkey objects
 */
export function extractRefKeysFromValue(value: any, visited = new Set<any>()): RefKey[] {
  const refkeys: RefKey[] = []

  if (visited.has(value)) {
    return refkeys
  }

  if (value === null || value === undefined) {
    return refkeys
  }

  visited.add(value)

  if (isRefKey(value)) {
    refkeys.push(value)
    return refkeys
  }

  if (typeof value === 'string') {
    // Could potentially parse template strings for refkeys in the future
    return refkeys
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      refkeys.push(...extractRefKeysFromValue(item, visited))
    }
    return refkeys
  }

  if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      refkeys.push(...extractRefKeysFromValue(value[key], visited))
    }
    return refkeys
  }

  return refkeys
}

/**
 * Resolve imports for a file based on refkey usage
 */
export function resolveImportsFromRefKeys(
  file: KubbFile.File,
  registry: RefKeyRegistry,
  currentFilePath: string,
): KubbFile.Import[] {
  const imports: KubbFile.Import[] = []
  const importMap = new Map<string, Set<string>>()
  const typeImportMap = new Map<string, Set<string>>()

  // Extract all refkeys used in this file's sources
  for (const source of file.sources) {
    const refkeys = extractRefKeysFromValue(source.value)

    for (const refkey of refkeys) {
      const definition = registry.getDefinition(refkey.id)

      if (!definition) continue
      if (definition.path === currentFilePath) continue // Don't import from same file

      const importPath = definition.path
      const symbolName = definition.name

      if (definition.isTypeOnly) {
        if (!typeImportMap.has(importPath)) {
          typeImportMap.set(importPath, new Set())
        }
        typeImportMap.get(importPath)!.add(symbolName)
      } else {
        if (!importMap.has(importPath)) {
          importMap.set(importPath, new Set())
        }
        importMap.get(importPath)!.add(symbolName)
      }
    }
  }

  // Convert maps to import objects
  for (const [path, names] of importMap.entries()) {
    imports.push({
      path,
      name: Array.from(names),
      isTypeOnly: false,
    })
  }

  for (const [path, names] of typeImportMap.entries()) {
    imports.push({
      path,
      name: Array.from(names),
      isTypeOnly: true,
    })
  }

  return imports
}
