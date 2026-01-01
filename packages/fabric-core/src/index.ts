export { createFabric } from './createFabric.ts'
export { createFile } from './createFile.ts'
// we need this to override the globals of `fabric.use`
export type { Fabric } from './Fabric.ts'
export { FileManager } from './FileManager.ts'
export { FileProcessor } from './FileProcessor.ts'
export { createRefKey, isRefKey, refKeyToString, type RefKey } from './utils/refkey.ts'
export { RefKeyRegistry, extractRefKeysFromValue, resolveImportsFromRefKeys } from './utils/importResolver.ts'
