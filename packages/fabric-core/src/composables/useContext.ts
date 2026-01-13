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
export function useContext<T, TValue = T>(key: Context<T>, defaultValue: TValue): NonNullable<T> | TValue
export function useContext<T>(key: Context<T>, defaultValue?: T): T {
  return inject(key, defaultValue)
}
