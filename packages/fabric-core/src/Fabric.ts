import type { FileManager } from './FileManager.ts'
import type { Intrinsic } from './intrinsic.ts'
import type * as KubbFile from './KubbFile.ts'
import type { Parser } from './parsers/types.ts'
import type { Plugin } from './plugins/types.ts'
import type { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

declare global {
  namespace Kubb {
    interface Fabric {}
  }
}

export type FabricElement<TProps extends object = object> = {
  (): FabricNode
  type: string
  component: (props: TProps) => FabricNode
  props: TProps
}

export type FabricNode = FabricElement<any> | string | number | boolean | null | undefined | Intrinsic | Array<FabricNode>

export type FabricComponent<TProps extends object = object> = FabricElement<TProps> & {
  children(...children: Array<FabricNode>): FabricElement<TProps>
}

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
 * @default 'sequential'
 */
export type FabricMode = 'sequential' | 'parallel'

/**
 * Event definitions emitted during the Fabric lifecycle.
 *
 * These events allow plugins and external code to hook into different stages
 * of the file generation process. All events are asynchronous and can be
 * listened to using `fabric.context.on()` or `fabric.context.onOnce()`.
 *
 * @example
 * ```ts
 * fabric.context.on('lifecycle:start', async () => {
 *   console.log('Fabric started!')
 * })
 * ```
 */
export interface FabricEvents {
  /**
   * Emitted when the Fabric application lifecycle begins.
   * This is typically the first event fired when starting a Fabric run.
   * Use this to perform initial setup or logging.
   */
  'lifecycle:start': []

  /**
   * Emitted when the Fabric application lifecycle completes.
   * This is typically the last event fired after all processing is done.
   * Use this for cleanup tasks or final reporting.
   */
  'lifecycle:end': []

  /**
   * Emitted when Fabric starts rendering (used with reactPlugin).
   * Provides access to the Fabric instance for render-time operations.
   */
  'lifecycle:render': [fabric: Fabric]

  /**
   * Emitted once before file processing begins.
   * Provides the complete list of files that will be processed.
   * Use this to prepare for batch operations or display initial file counts.
   */
  'files:processing:start': [files: Array<KubbFile.ResolvedFile>]

  /**
   * Emitted when files are successfully added to the FileManager's internal cache.
   * This happens after files pass through path and name resolution.
   * Use this to track which files have been registered.
   */
  'files:added': [files: Array<KubbFile.ResolvedFile>]

  /**
   * Emitted during file path resolution, before a file is cached.
   * Listeners can modify the file's path property to customize output location.
   * This is called for each file being added via `addFile()` or `upsertFile()`.
   */
  'file:resolve:path': [file: KubbFile.File]

  /**
   * Emitted during file name resolution, before a file is cached.
   * Listeners can modify the file's name-related properties to customize naming.
   * This is called for each file being added via `addFile()` or `upsertFile()`.
   */
  'file:resolve:name': [file: KubbFile.File]

  /**
   * Emitted just before files are written to disk.
   * Provides all files that will be written in this batch.
   * Use this to perform pre-write operations like creating directories.
   */
  'files:writing:start': [files: Array<KubbFile.ResolvedFile>]

  /**
   * Emitted after all files have been successfully written to disk.
   * Provides all files that were written in this batch.
   * Use this for post-write operations like running formatters or reporting.
   */
  'files:writing:end': [files: Array<KubbFile.ResolvedFile>]

  /**
   * Emitted when an individual file starts being processed.
   * This happens for each file in the queue, before parsing.
   * Use this for per-file setup or detailed logging.
   */
  'file:processing:start': [file: KubbFile.ResolvedFile, index: number, total: number]

  /**
   * Emitted when an individual file completes processing.
   * This happens after the file has been parsed and handled.
   * Use this for per-file cleanup or progress tracking.
   */
  'file:processing:end': [file: KubbFile.ResolvedFile, index: number, total: number]

  /**
   * Emitted after each file is processed, providing progress metrics.
   * This is the primary event for implementing progress bars or tracking.
   * Plugins like fsPlugin use this to write files to disk.
   *
   * @property processed - Number of files processed so far
   * @property total - Total number of files to process
   * @property percentage - Completion percentage (0-100)
   * @property source - Optional parsed source code of the file
   * @property file - The file that was just processed
   */
  'file:processing:update': [
    {
      processed: number
      total: number
      percentage: number
      source?: string
      file: KubbFile.ResolvedFile
    },
  ]

  /**
   * Emitted once all files have been successfully processed.
   * This marks the completion of the processing phase.
   * Use this to perform batch operations on all processed files.
   */
  'files:processing:end': [files: Array<KubbFile.ResolvedFile>]
}

/**
 * Shared context passed to all plugins, parsers, and Fabric internals.
 */
export interface FabricContext<T extends FabricOptions = FabricOptions> extends AsyncEventEmitter<FabricEvents> {
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
