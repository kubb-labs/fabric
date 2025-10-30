import type { FileManager } from './FileManager.ts'
import type * as KubbFile from './KubbFile.ts'
import type { Parser } from './parsers/types.ts'
import type { Plugin } from './plugins/types.ts'
import type { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

declare global {
  namespace Kubb {
    interface Fabric {}
  }
}

export type Component = any

export type FabricOptions = {
  /**
   * @default 'sequential'
   */
  mode?: FabricMode
}

export type FabricEvents = {
  /**
   * Called in the beginning of the app lifecycle.
   */
  start: []
  /**
   * Called in the end of the app lifecycle.
   */
  end: []
  /**
   * Called when being rendered
   */
  render: [{ fabric: Fabric }]
  /**
   * Called once before processing any files.
   */
  'process:start': [{ files: KubbFile.ResolvedFile[] }]
  /**
   * Called when FileManager is adding files to its cache
   */

  'file:add': [{ files: KubbFile.ResolvedFile[] }]
  'write:start': [{ files: KubbFile.ResolvedFile[] }]
  'write:end': [{ files: KubbFile.ResolvedFile[] }]
  /**
   * Called for each file when processing begins.
   */
  'file:start': [{ file: KubbFile.ResolvedFile; index: number; total: number }]

  /**
   * Called for each file when processing finishes.
   */
  'file:end': [{ file: KubbFile.ResolvedFile; index: number; total: number }]

  /**
   * Called periodically (or after each file) to indicate progress.
   * Useful for progress bars or logging.
   */
  'process:progress': [
    {
      processed: number
      total: number
      percentage: number
      source?: string
      file: KubbFile.ResolvedFile
    },
  ]

  /**
   * Called once all files have been processed successfully.
   */
  'process:end': [{ files: KubbFile.ResolvedFile[] }]
}

export type FabricContext<TOptions extends FabricOptions> = {
  config?: FabricConfig<TOptions>
  events: AsyncEventEmitter<FabricEvents>
  fileManager: FileManager
  installedPlugins: Set<Plugin>
  installedParsers: Set<Parser>
}

export type FabricMode = 'sequential' | 'parallel'

type AllOptional<T> = {} extends T ? true : false

export type FabricConfig<TOptions extends FabricOptions> = {
  options: TOptions
}

export type Install<TOptions = unknown> = TOptions extends any[]
  ? (app: Fabric, ...options: TOptions) => void | Promise<void>
  : AllOptional<TOptions> extends true
    ? (app: Fabric, options: TOptions | undefined) => void | Promise<void>
    : (app: Fabric, options: TOptions) => void | Promise<void>

export type Inject<TOptions = unknown, TAppExtension extends Record<string, any> = {}> = TOptions extends any[]
  ? (app: Fabric, ...options: TOptions) => Partial<TAppExtension>
  : AllOptional<TOptions> extends true
    ? (app: Fabric, options: TOptions | undefined) => Partial<TAppExtension>
    : (app: Fabric, options: TOptions) => Partial<TAppExtension>

export interface Fabric<TOptions extends FabricOptions = FabricOptions> extends Kubb.Fabric {
  context: FabricContext<TOptions>
  files: Array<KubbFile.ResolvedFile>
  use<TPluginOptions = unknown, TMeta extends object = object, TAppExtension extends Record<string, any> = {}>(
    pluginOrParser: Plugin<TPluginOptions, TAppExtension> | Parser<TPluginOptions, TMeta>,
    ...options: TPluginOptions extends any[]
      ? NoInfer<TPluginOptions>
      : AllOptional<TPluginOptions> extends true
        ? [NoInfer<TPluginOptions>?] // Optional when all props are optional
        : [NoInfer<TPluginOptions>] // Required otherwise
  ): (this & TAppExtension) | Promise<this & TAppExtension>
  addFile(...files: Array<KubbFile.File>): Promise<void>
}
