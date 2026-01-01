import { createHash } from 'node:crypto'

/**
 * Represents a reference to a code symbol that can be used across files.
 * Inspired by Alloy's refkey system for automatic import management.
 */
export type RefKey<T = any> = {
  /**
   * Unique identifier for this reference
   */
  id: string
  /**
   * The symbol name being referenced
   */
  name?: string
  /**
   * The file path where this symbol is defined
   */
  path?: string
  /**
   * Whether this is a type-only reference
   */
  isTypeOnly?: boolean
  /**
   * The actual value (for inline usage)
   */
  value?: T
  /**
   * Mark this refkey as resolved
   */
  resolve(name: string, path: string, options?: { isTypeOnly?: boolean }): RefKey<T>
}

/**
 * Create a unique reference key that can be used to automatically manage imports.
 * When a refkey is used in one file that references a symbol from another file,
 * the import will be automatically added.
 * 
 * @example
 * ```ts
 * const fooRef = createRefKey()
 * 
 * // In file1.ts - define the symbol
 * fabric.addFile({
 *   path: 'file1.ts',
 *   sources: [{
 *     name: 'foo',
 *     value: 'export const foo = "hello"',
 *     refkey: fooRef.resolve('foo', './file1.ts')
 *   }]
 * })
 * 
 * // In file2.ts - use the symbol (import will be auto-added)
 * fabric.addFile({
 *   path: 'file2.ts',
 *   sources: [{
 *     value: `console.log(${fooRef})`
 *   }]
 * })
 * // Results in: import { foo } from './file1'
 * ```
 */
export function createRefKey<T = any>(name?: string): RefKey<T> {
  const id = createHash('sha256')
    .update(`${name || 'refkey'}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 16)

  const refkey: RefKey<T> = {
    id,
    name,
    resolve(symbolName: string, sourcePath: string, options?: { isTypeOnly?: boolean }) {
      refkey.name = symbolName
      refkey.path = sourcePath
      refkey.isTypeOnly = options?.isTypeOnly
      return refkey
    },
  }

  return refkey
}

/**
 * Check if a value is a RefKey
 */
export function isRefKey(value: unknown): value is RefKey {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'resolve' in value &&
    typeof (value as RefKey).resolve === 'function'
  )
}

/**
 * Convert a refkey to its string representation (the symbol name)
 * This is useful when embedding refkeys in template strings
 */
export function refKeyToString(refkey: RefKey): string {
  return refkey.name || refkey.id
}
