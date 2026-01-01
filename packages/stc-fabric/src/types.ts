/**
 * String Template Component (stc) types
 * Provides a signal-based component model without React dependency
 * Inspired by Vue.js composable patterns
 */

/**
 * A component function that accepts props and returns a string
 * Unlike React components, stc components are synchronous and return strings directly
 */
export type StcComponent<TProps = {}> = (props: TProps) => string

/**
 * Reference to a named entity (variable, type, etc.) for tracking dependencies
 */
export interface StcReference<T = any> {
  name: string
  value: T
}

/**
 * Reactive reference (similar to Vue's ref)
 */
export interface Ref<T = any> {
  value: T
}
