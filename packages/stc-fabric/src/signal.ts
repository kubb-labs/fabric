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
 * Creates a stateful value (React-style)
 * Returns a tuple of [value, setValue] similar to React's useState
 * 
 * @example
 * ```ts
 * const [count, setCount] = useState(0)
 * console.log(count()) // 0
 * setCount(5)
 * console.log(count()) // 5
 * 
 * // or with updater function
 * setCount(prev => prev + 1)
 * ```
 */
export function useState<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  let _value = initialValue

  const getValue = () => _value
  
  const setValue = (newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      _value = (newValue as (prev: T) => T)(_value)
    } else {
      _value = newValue
    }
  }

  return [getValue, setValue]
}

/**
 * Legacy alias for ref() - use ref() instead
 * @deprecated Use ref() for Vue-style naming
 */
export const createSignal = ref
