/**
 * String Template Component (stc) types
 * Provides a signal-based component model without React dependency
 */

/**
 * A component function that accepts props and returns a string or Promise<string>
 */
export type StcComponent<TProps = {}> = (props: TProps) => string | Promise<string>

/**
 * Context value for dependency injection
 */
export interface StcContext<T = any> {
  Provider: StcComponent<{ value: T; children?: string }>
  defaultValue: T
}

/**
 * Reference to a named entity (variable, type, etc.) for tracking dependencies
 */
export interface StcReference<T = any> {
  name: string
  value: T
}

/**
 * Signal-like reactive value
 */
export interface StcSignal<T = any> {
  get value(): T
  set value(v: T)
}
