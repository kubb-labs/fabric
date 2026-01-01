import type { StcReference } from './types.ts'

/**
 * Reference storage for tracking named entities
 */
const references = new Map<string, StcReference<any>>()

/**
 * Creates a reference to a named entity for dependency tracking
 * 
 * @example
 * ```ts
 * const myVar = createReference('myVariable', 'const myVariable = 42')
 * ```
 */
export function createReference<T = any>(name: string, value: T): StcReference<T> {
  const ref: StcReference<T> = { name, value }
  references.set(name, ref)
  return ref
}

/**
 * Retrieves a reference by name
 * 
 * @example
 * ```ts
 * const myVar = getReference('myVariable')
 * ```
 */
export function getReference<T = any>(name: string): StcReference<T> | undefined {
  return references.get(name)
}

/**
 * Clears all references (useful for testing)
 */
export function clearReferences(): void {
  references.clear()
}
