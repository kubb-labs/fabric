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

/**
 * Component placeholder type.
 * May later be extended to support specific runtime renderers.
 */
export type Component = any

/**
 * Defines core runtime options for Fabric.
 */
export interface FabricOptions {
  /**
   * Determines how Fabric processes files.
   * - `sequential`: files are processed one by one
   * - `parallel`: files are processed concurrently
   *
   * @default 'sequential'
   */
  mode?: FabricMode
}

/**
 * Available modes for file processing.
 */
export type FabricMode = 'sequential' | 'parallel'

/**
 * Event definitions emitted during the Fabric lifecycle.
 * Uses Vue-style emit pattern for better type inference.
 */
export interface FabricEvents {
  /** Called at the beginning of the app lifecycle. */
  (e: 'lifecycle:start'): void

  /** Called at the end of the app lifecycle. */
  (e: 'lifecycle:end'): void

  /** Called when Fabric is rendering. */
  (e: 'lifecycle:render', payload: { fabric: Fabric }): void

  /** Called once before any files are processed. */
  (e: 'files:processing:start', payload: { files: KubbFile.ResolvedFile[] }): void

  /**
   * Called when FileManager is adding files to its cache
   */
  (e: 'files:added', payload: { files: KubbFile.ResolvedFile[] }): void

  (e: 'file:path:resolving', payload: { file: KubbFile.File }): void

  (e: 'file:name:resolving', payload: { file: KubbFile.File }): void

  (e: 'files:writing:start', payload: { files: KubbFile.ResolvedFile[] }): void

  (e: 'files:writing:end', payload: { files: KubbFile.ResolvedFile[] }): void

  /** Called for each file when processing begins. */
  (e: 'file:processing:start', payload: { file: KubbFile.ResolvedFile; index: number; total: number }): void

  /** Called for each file when processing completes. */
  (e: 'file:processing:end', payload: { file: KubbFile.ResolvedFile; index: number; total: number }): void

  /**
   * Called periodically (or per file) to indicate progress.
   * Useful for progress bars or logging.
   */
  (
    e: 'files:processing:update',
    payload: {
      processed: number
      total: number
      percentage: number
      source?: string
      file: KubbFile.ResolvedFile
    },
  ): void

  /** Called once all files have been processed successfully. */
  (e: 'files:processing:end', payload: { files: KubbFile.ResolvedFile[] }): void
}

/**
 * Utility type to convert callable event interface to Record type for AsyncEventEmitter
 */
type EventsToRecord<T> = T extends {
  (e: infer E, ...args: infer A): void
}
  ? E extends string
    ? A extends []
      ? { [K in E]: [] }
      : A extends [infer P]
        ? { [K in E]: [P] }
        : never
    : never
  : never

/**
 * Extract all event overloads from FabricEvents into a Record type
 */
export type FabricEventsRecord = {
  'lifecycle:start': []
  'lifecycle:end': []
  'lifecycle:render': [{ fabric: Fabric }]
  'files:processing:start': [{ files: KubbFile.ResolvedFile[] }]
  'files:added': [{ files: KubbFile.ResolvedFile[] }]
  'file:path:resolving': [{ file: KubbFile.File }]
  'file:name:resolving': [{ file: KubbFile.File }]
  'files:writing:start': [{ files: KubbFile.ResolvedFile[] }]
  'files:writing:end': [{ files: KubbFile.ResolvedFile[] }]
  'file:processing:start': [{ file: KubbFile.ResolvedFile; index: number; total: number }]
  'file:processing:end': [{ file: KubbFile.ResolvedFile; index: number; total: number }]
  'files:processing:update': [
    {
      processed: number
      total: number
      percentage: number
      source?: string
      file: KubbFile.ResolvedFile
    },
  ]
  'files:processing:end': [{ files: KubbFile.ResolvedFile[] }]
}

/**
 * Shared context passed to all plugins, parsers, and Fabric internals.
 */
export interface FabricContext<T extends FabricOptions = FabricOptions> extends AsyncEventEmitter<FabricEventsRecord> {
  /** The active Fabric configuration. */
  config: FabricConfig<T>

  /** The internal file manager handling file creation, merging, and writing. */
  fileManager: FileManager

  /** List of files currently in memory. */
  files: KubbFile.ResolvedFile[]

  /** Add new files to the file manager. */
  addFile(...files: KubbFile.File[]): Promise<void>

  /** Track installed plugins and parsers to prevent duplicates. */
  installedPlugins: Set<Plugin>
  installedParsers: Map<KubbFile.Extname, Parser>
}

/**
 * Base configuration object for Fabric.
 */
export type FabricConfig<T extends FabricOptions = FabricOptions> = T

/**
 * Utility type that checks whether all properties of `T` are optional.
 */
type AllOptional<T> = {} extends T ? true : false

/**
 * Defines the signature of a plugin or parser's `install` function.
 */
export type Install<TOptions = unknown> = TOptions extends any[]
  ? (context: FabricContext, ...options: TOptions) => void | Promise<void>
  : AllOptional<TOptions> extends true
    ? (context: FabricContext, options?: TOptions) => void | Promise<void>
    : (context: FabricContext, options: TOptions) => void | Promise<void>

/**
 * Defines the signature of a plugin or parser's `inject` function.
 * Returns an object that extends the Fabric instance.
 */
export type Inject<TOptions = unknown, TExtension extends Record<string, any> = {}> = TOptions extends any[]
  ? (context: FabricContext, ...options: TOptions) => Partial<TExtension>
  : AllOptional<TOptions> extends true
    ? (context: FabricContext, options?: TOptions) => Partial<TExtension>
    : (context: FabricContext, options: TOptions) => Partial<TExtension>

/**
 * The main Fabric runtime interface.
 * Provides access to the current context, registered plugins, files, and utility methods.
 */
export interface Fabric<T extends FabricOptions = FabricOptions> extends Kubb.Fabric {
  /** The shared context for this Fabric instance. */
  context: FabricContext<T>

  /** The files managed by this Fabric instance. */
  files: KubbFile.ResolvedFile[]

  /**
   * Install a plugin or parser into Fabric.
   *
   * @param target - The plugin or parser to install.
   * @param options - Optional configuration or arguments for the target.
   * @returns A Fabric instance extended by the plugin (if applicable).
   */
  use<TPluginOptions = unknown, TMeta extends object = object, TExtension extends Record<string, any> = {}>(
    target: Plugin<TPluginOptions, TExtension> | Parser<TPluginOptions, TMeta>,
    ...options: TPluginOptions extends any[]
      ? NoInfer<TPluginOptions>
      : AllOptional<TPluginOptions> extends true
        ? [NoInfer<TPluginOptions>?] // Optional when all props are optional
        : [NoInfer<TPluginOptions>] // Required otherwise
  ): (this & TExtension) | Promise<this & TExtension>

  /**
   * Add one or more files to the Fabric file manager.
   */
  addFile(...files: KubbFile.File[]): Promise<void>
  /**
   * Add one or more files to the Fabric file manager and merge the source, imports, exports
   */
  upsertFile(...files: KubbFile.File[]): Promise<void>
}
