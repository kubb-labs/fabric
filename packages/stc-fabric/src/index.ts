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
export { App, AppContext } from './components/App.ts'
export type { AppContextProps } from './components/App.ts'
export { Const } from './components/Const.ts'
export { Function } from './components/Function.ts'
export { Type } from './components/Type.ts'
export { Indent } from './components/Indent.ts'
export { Root, RootContext } from './components/Root.ts'
export type { RootContextProps } from './components/Root.ts'

// plugins
export { stcPlugin } from './plugins/index.ts'
export type { StcPluginOptions } from './plugins/index.ts'

// composables (hooks with 'use' prefix)
export { useApp } from './composables/useApp.ts'
export { useFile } from './composables/useFile.ts'
export { useLifecycle } from './composables/useLifecycle.ts'

