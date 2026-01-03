import type { Context } from '../context.ts'
import { inject } from '../context.ts'

/**
 * React-style alias for inject
 *
 * @example
 * ```ts
 * const theme = useContext(ThemeContext) // type is inferred from ThemeContext
 * ```
 */
export function useContext<T>(key: Context<T>): T
export function useContext<T>(key: Context<T>, defaultValue: T): T
export function useContext<T>(key: Context<T>, defaultValue?: T): T {
  return inject(key, defaultValue)
}
