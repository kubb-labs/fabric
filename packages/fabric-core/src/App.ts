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
  start: [{ app: App }]
  /**
   * Called in the end of the app lifecycle.
   */
  end: [{ app: App }]
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

export type Install<TOptions = any[] | object | undefined> = TOptions extends any[]
  ? (app: App, ...options: TOptions) => void
  : TOptions extends object
    ? (app: App, options?: TOptions) => void
    : (app: App) => void

export type Inject<TOptions = any[] | object | undefined, TAppExtension extends Record<string, any> = {}> = TOptions extends any[]
  ? (app: App, ...options: TOptions) => Partial<TAppExtension>
  : TOptions extends object
    ? (app: App, options?: TOptions) => Partial<TAppExtension>
    : (app: App) => Partial<TAppExtension>

export interface App<TOptions = unknown> extends Kubb.App {
  context: AppContext<TOptions>
  files: Array<KubbFile.ResolvedFile>
  use<TOptions extends any[] | object = any, TMeta extends object = object, TAppExtension extends Record<string, any> = {}>(
    pluginOrParser: Plugin<TOptions, TAppExtension> | Parser<TOptions, TMeta>,
    ...options: TOptions extends any[] ? NoInfer<TOptions> : [NoInfer<TOptions>]
  ): this & TAppExtension
  use<TOptions extends any[] | object = any, TMeta extends object = object, TAppExtension extends Record<string, any> = {}>(
    pluginOrParser: Plugin<TOptions, TAppExtension> | Parser<TOptions, TMeta>,
  ): this & TAppExtension
  addFile(...files: Array<KubbFile.File>): Promise<void>
}
