import type { Ref } from './types.ts'

/**
 * Creates a reactive reference (similar to Vue's ref)
 * 
 * @example
 * ```ts
 * const count = ref(0)
 * console.log(count.value) // 0
 * count.value = 5
 * console.log(count.value) // 5
 * ```
 */
export function ref<T>(initialValue: T): Ref<T> {
  return {
    value: initialValue,
  }
}

/**
 * Legacy alias for ref() - use ref() instead
 * @deprecated Use ref() for Vue-style naming
 */
export const createSignal = ref
