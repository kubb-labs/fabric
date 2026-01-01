/**
 * String Template Components (stc)
 * 
 * A signal-based component model for code generation without React dependency.
 * Inspired by the Alloy framework (https://alloy-framework.github.io/alloy/)
 * and Vue.js composable patterns
 */

// expose fabric core helpers
export * from '@kubb/fabric-core'

// stc core functionality
export { code, stc, template } from './stc.ts'
export { createContext, inject, provide, unprovide, useContext } from './context.ts'
export { clearReferences, createReference, getReference } from './reference.ts'
export { createSignal, ref, useState } from './signal.ts'
export { createStcFabric } from './createStcFabric.ts'
export type { Ref, StcComponent, StcReference } from './types.ts'

