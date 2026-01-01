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
export { createStcFabric } from './createStcFabric.ts'
export type { StcComponent } from './types.ts'

// components
export { File, FileCollectorContext, FileExport, FileImport, FileNamespace, FileSource } from './components/File.ts'
export type { FileProps } from './components/File.ts'

// plugins
export { stcPlugin } from './plugins/index.ts'
export type { StcPluginOptions } from './plugins/index.ts'

