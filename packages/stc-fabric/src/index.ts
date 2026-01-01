/**
 * String Template Components (stc)
 * 
 * A signal-based component model for code generation without React dependency.
 * Inspired by the Alloy framework (https://alloy-framework.github.io/alloy/)
 */

// expose fabric core helpers
export * from '@kubb/fabric-core'

// stc core functionality
export { code, stc, template } from './stc.ts'
export { createContext, useContext } from './context.ts'
export { clearReferences, createReference, getReference } from './reference.ts'
export { createSignal } from './signal.ts'
export { createStcFabric } from './createStcFabric.ts'
export type { StcComponent, StcContext, StcReference, StcSignal } from './types.ts'

