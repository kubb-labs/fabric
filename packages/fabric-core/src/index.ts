// composables

export { App } from './components/App.ts'
export { Const } from './components/Const.ts'
export { File } from './components/File.ts'
export { Function } from './components/Function.ts'
export { Root } from './components/Root.ts'
// components
export { Type } from './components/Type.ts'
export { useApp } from './composables/useApp.ts'
export { useContext } from './composables/useContext.ts'
export { useFile } from './composables/useFile.ts'
export { useLifecycle } from './composables/useLifecycle.ts'

// context api
export type { Context } from './context.ts'
export { createContext, inject, provide, unprovide } from './context.ts'
export { AppContext } from './contexts/AppContext.ts'
export { FileCollectorContext } from './contexts/FileCollectorContext.ts'
export { RootContext } from './contexts/RootContext.ts'

// helpers
export { createFabric } from './createFabric.ts'
export { createFile } from './createFile.ts'
export { createJSDoc } from './utils/createJSDoc.ts'
export { FileCollector } from './utils/FileCollector.ts'
// we need this to override the globals of `fabric.use`

// utils
export type { Fabric } from './Fabric.ts'
export { FileManager } from './FileManager.ts'
export { FileProcessor } from './FileProcessor.ts'
