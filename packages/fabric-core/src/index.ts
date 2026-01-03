// stc (String Template Components)
export type { AppContextProps } from './components/App.ts'
export { App, AppContext } from './components/App.ts'
export { Const } from './components/Const.ts'
export type { FileProps } from './components/File.ts'
export { File, FileCollectorContext, FileExport, FileImport, FileNamespace, FileSource } from './components/File.ts'
export { Function } from './components/Function.ts'
export { Indent } from './components/Indent.ts'
export type { RootContextProps } from './components/Root.ts'
export { Root, RootContext } from './components/Root.ts'
export { Type } from './components/Type.ts'
export { useApp } from './composables/useApp.ts'
export { useContext } from './composables/useContext.ts'
export { useFile } from './composables/useFile.ts'
export { useLifecycle } from './composables/useLifecycle.ts'
export { type Context, createContext, inject, provide, unprovide } from './context.ts'
export { createFabric } from './createFabric.ts'
export { createFile } from './createFile.ts'
export { createStcFabric } from './createStcFabric.ts'
// we need this to override the globals of `fabric.use`
export type { Fabric } from './Fabric.ts'
export { FileCollector } from './FileCollector.ts'
export { FileManager } from './FileManager.ts'
export { FileProcessor } from './FileProcessor.ts'
// Intrinsic formatting elements
export {
  align,
  br,
  dedent,
  fill,
  group,
  hbr,
  type Intrinsic,
  type IntrinsicType,
  ifBreak,
  indent,
  indentIfBreak,
  isIntrinsic,
  lbr,
  renderIntrinsics,
  sbr,
} from './intrinsic.ts'
export type { StcPluginOptions } from './plugins/stcPlugin.ts'
export { stcPlugin } from './plugins/stcPlugin.ts'
export type { StcComponent } from './stc.ts'
export { code, stc } from './stc.ts'
