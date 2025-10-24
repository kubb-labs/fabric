import type * as KubbFile from './KubbFile.ts'
import type { Plugin } from './plugins/types.ts'
import type { Parser } from './parsers/types.ts'
import type { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { FileManager } from './FileManager.ts'

declare global {
  namespace Kubb {
    interface App {}
  }
}

export type Component = any

export type AppEvents = {
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
  render: [{ app: App }]
  /**
   * Called once before processing any files.
   */
  'process:start': [{ files: KubbFile.ResolvedFile[] }]

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
      source: string
      file: KubbFile.ResolvedFile
    },
  ]

  /**
   * Called once all files have been processed successfully.
   */
  'process:end': [{ files: KubbFile.ResolvedFile[] }]
}

export type AppContext<TOptions = unknown> = {
  options?: TOptions
  events: AsyncEventEmitter<AppEvents>
  fileManager: FileManager
  installedPlugins: Set<Plugin>
  installedParsers: Set<Parser>
}

type AllOptional<T> = {} extends T ? true : false

export type Install<TOptions = unknown> = TOptions extends any[]
  ? (app: App, ...options: TOptions) => void
  : AllOptional<TOptions> extends true
    ? (app: App, options: TOptions | undefined) => void
    : (app: App, options: TOptions) => void

export type Inject<TOptions = unknown, TAppExtension extends Record<string, any> = {}> = TOptions extends any[]
  ? (app: App, ...options: TOptions) => Partial<TAppExtension>
  : AllOptional<TOptions> extends true
    ? (app: App, options: TOptions | undefined) => Partial<TAppExtension>
    : (app: App, options: TOptions) => Partial<TAppExtension>

export interface App<TOptions = unknown> extends Kubb.App {
  context: AppContext<TOptions>
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
