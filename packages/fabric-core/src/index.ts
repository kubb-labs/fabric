// components

export { App } from './components/App.ts'
export { Const } from './components/Const.ts'
export { File } from './components/File.ts'
export { Function } from './components/Function.ts'
export { Root } from './components/Root.ts'
export { Type } from './components/Type.ts'

// composables
export { useApp } from './composables/useApp.ts'
export { useContext } from './composables/useContext.ts'
export { useFile } from './composables/useFile.ts'
export { useFileManager } from './composables/useFileManager.ts'
export { useLifecycle } from './composables/useLifecycle.ts'
export { useNodeTree } from './composables/useNodeTree.ts'

// context api
export type { Context } from './context.ts'
export { createContext, inject, provide, unprovide } from './context.ts'
export { AppContext } from './contexts/AppContext.ts'
export { FileContext } from './contexts/FileContext.ts'
export { NodeTreeContext } from './contexts/NodeTreeContext.ts'
export { RootContext } from './contexts/RootContext.ts'
export { createComponent } from './createComponent.ts'
// helpers
export { createFabric } from './createFabric.ts'
export { createFile } from './createFile.ts'
export { Br, Dedent, Indent } from './transform.ts'
export { createJSDoc } from './utils/createJSDoc.ts'
export { getRelativePath } from './utils/getRelativePath.ts'

// we need this to override the globals of `fabric.use`

// utils
export type { Fabric } from './Fabric.ts'
export { FileManager } from './FileManager.ts'
export { FileProcessor } from './FileProcessor.ts'
export { TreeNode } from './utils/TreeNode.ts'
