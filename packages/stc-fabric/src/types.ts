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

// Re-export Context from fabric-core
export type { Context } from '@kubb/fabric-core'
