import type { StcSignal } from './types.ts'

/**
 * Creates a signal - a reactive value that can be read and written
 * 
 * @example
 * ```ts
 * const count = createSignal(0)
 * console.log(count.value) // 0
 * count.value = 5
 * console.log(count.value) // 5
 * ```
 */
export function createSignal<T>(initialValue: T): StcSignal<T> {
  let _value = initialValue

  return {
    get value() {
      return _value
    },
    set value(newValue: T) {
      _value = newValue
    },
  }
}
