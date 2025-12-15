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
 *
 * @remarks
 * These events are organized into three main categories:
 * - **Lifecycle Events**: Application-level events (`lifecycle:*`)
 * - **File Management Events**: File addition and resolution (`files:added`, `file:*:resolving`)
 * - **File Processing Events**: File processing and writing operations (`files:processing:*`, `files:writing:*`, `file:processing:*`)
 *
 * @example
 * Subscribing to lifecycle events:
 * ```ts
 * const fabric = createFabric()
 *
 * fabric.context.on('lifecycle:start', async () => {
 *   console.log('Fabric started')
 * })
 *
 * fabric.context.on('lifecycle:end', async () => {
 *   console.log('Fabric completed')
 * })
 * ```
 *
 * @example
 * Subscribing to file processing events:
 * ```ts
 * fabric.context.on('files:processing:update', async ({ processed, total, percentage, file }) => {
 *   console.log(`Processing: ${percentage.toFixed(1)}% (${processed}/${total})`)
 *   console.log(`Current file: ${file.path}`)
 * })
 * ```
 */
export interface FabricEvents {
  // ============================================================
  // Lifecycle Events
  // ============================================================

  /**
   * Emitted at the beginning of the application lifecycle.
   *
   * @remarks
   * This is the first event emitted when Fabric starts execution.
   * Use this event to perform initialization tasks or logging.
   *
   * @example
   * ```ts
   * fabric.context.on('lifecycle:start', async () => {
   *   console.log('Initializing Fabric...')
   * })
   * ```
   */
  'lifecycle:start': []

  /**
   * Emitted at the end of the application lifecycle.
   *
   * @remarks
   * This is the last event emitted when Fabric completes execution.
   * Use this event for cleanup tasks, final logging, or resource disposal.
   *
   * @example
   * ```ts
   * fabric.context.on('lifecycle:end', async () => {
   *   console.log('Fabric run completed successfully')
   *   // Perform cleanup tasks
   * })
   * ```
   */
  'lifecycle:end': []

  /**
   * Emitted when Fabric is rendering components or application graph.
   *
   * @param params - Event parameters
   * @param params.fabric - The current Fabric instance being rendered
   *
   * @remarks
   * This event is typically used when rendering React components or
   * generating visual representations of the application structure.
   *
   * @example
   * ```ts
   * fabric.context.on('lifecycle:render', async ({ fabric }) => {
   *   console.log('Rendering application with', fabric.files.length, 'files')
   * })
   * ```
   */
  'lifecycle:render': [{ fabric: Fabric }]

  // ============================================================
  // File Management Events
  // ============================================================

  /**
   * Emitted when files are added to the FileManager's cache.
   *
   * @param params - Event parameters
   * @param params.files - Array of resolved files that were added
   *
   * @remarks
   * This event fires after files are successfully queued in memory via
   * `fabric.addFile()` or `fabric.upsertFile()`. The files have been
   * resolved but not yet written to disk.
   *
   * @example
   * ```ts
   * fabric.context.on('files:added', async ({ files }) => {
   *   console.log(`Added ${files.length} file(s) to queue`)
   *   files.forEach(file => console.log(`  - ${file.path}`))
   * })
   * ```
   */
  'files:added': [{ files: KubbFile.ResolvedFile[] }]

  /**
   * Emitted when resolving a file's path.
   *
   * @param params - Event parameters
   * @param params.file - The file whose path is being resolved
   *
   * @remarks
   * This event allows plugins to intercept and modify file paths before
   * they are finalized. It is called during the file resolution phase
   * in the FileManager.
   *
   * @example
   * ```ts
   * fabric.context.on('file:path:resolving', async ({ file }) => {
   *   console.log(`Resolving path: ${file.path}`)
   *   // Optionally modify file.path here
   * })
   * ```
   */
  'file:path:resolving': [{ file: KubbFile.File }]

  /**
   * Emitted when resolving a file's name.
   *
   * @param params - Event parameters
   * @param params.file - The file whose name is being resolved
   *
   * @remarks
   * This event allows plugins to intercept and modify file names before
   * they are finalized. It is called during the file resolution phase
   * in the FileManager.
   *
   * @example
   * ```ts
   * fabric.context.on('file:name:resolving', async ({ file }) => {
   *   console.log(`Resolving name: ${file.baseName}`)
   *   // Optionally modify file.baseName here
   * })
   * ```
   */
  'file:name:resolving': [{ file: KubbFile.File }]

  // ============================================================
  // File Processing Events
  // ============================================================

  /**
   * Emitted once before any files are processed.
   *
   * @param params - Event parameters
   * @param params.files - Array of all files that will be processed
   *
   * @remarks
   * This event marks the beginning of the file processing phase.
   * Use it to initialize processing state or display startup information.
   *
   * @example
   * ```ts
   * fabric.context.on('files:processing:start', async ({ files }) => {
   *   console.log(`Starting to process ${files.length} file(s)`)
   * })
   * ```
   */
  'files:processing:start': [{ files: KubbFile.ResolvedFile[] }]

  /**
   * Emitted when an individual file's processing begins.
   *
   * @param params - Event parameters
   * @param params.file - The file being processed
   * @param params.index - Zero-based index of the current file
   * @param params.total - Total number of files to process
   *
   * @remarks
   * This event is emitted for each file before it is parsed and processed.
   * It provides context about the current position in the processing queue.
   *
   * @example
   * ```ts
   * fabric.context.on('file:processing:start', async ({ file, index, total }) => {
   *   console.log(`[${index + 1}/${total}] Processing ${file.path}`)
   * })
   * ```
   */
  'file:processing:start': [{ file: KubbFile.ResolvedFile; index: number; total: number }]

  /**
   * Emitted periodically to indicate file processing progress.
   *
   * @param params - Event parameters
   * @param params.file - The file that was just processed
   * @param params.source - Optional parsed source code of the file
   * @param params.processed - Number of files processed so far
   * @param params.total - Total number of files to process
   * @param params.percentage - Progress percentage (0-100)
   *
   * @remarks
   * This is the primary event for tracking processing progress. It's ideal
   * for implementing progress bars, logging, or triggering file writes.
   * The `source` field contains the parsed file content (undefined in dry-run mode).
   *
   * @example
   * ```ts
   * fabric.context.on('files:processing:update', async ({ processed, total, percentage, file, source }) => {
   *   console.log(`Progress: ${percentage.toFixed(1)}% (${processed}/${total})`)
   *   console.log(`File: ${file.path}`)
   *   if (source) {
   *     console.log(`Size: ${source.length} bytes`)
   *   }
   * })
   * ```
   */
  'files:processing:update': [
    {
      processed: number
      total: number
      percentage: number
      source?: string
      file: KubbFile.ResolvedFile
    },
  ]

  /**
   * Emitted when an individual file's processing completes.
   *
   * @param params - Event parameters
   * @param params.file - The file that finished processing
   * @param params.index - Zero-based index of the current file
   * @param params.total - Total number of files to process
   *
   * @remarks
   * This event is emitted after a file has been fully processed and parsed.
   * Use it for per-file completion logging or post-processing tasks.
   *
   * @example
   * ```ts
   * fabric.context.on('file:processing:end', async ({ file, index, total }) => {
   *   console.log(`[${index + 1}/${total}] Completed ${file.path}`)
   * })
   * ```
   */
  'file:processing:end': [{ file: KubbFile.ResolvedFile; index: number; total: number }]

  /**
   * Emitted once all files have been processed successfully.
   *
   * @param params - Event parameters
   * @param params.files - Array of all files that were processed
   *
   * @remarks
   * This event marks the completion of the file processing phase.
   * All files have been parsed and are ready for any post-processing steps.
   *
   * @example
   * ```ts
   * fabric.context.on('files:processing:end', async ({ files }) => {
   *   console.log(`Successfully processed ${files.length} file(s)`)
   * })
   * ```
   */
  'files:processing:end': [{ files: KubbFile.ResolvedFile[] }]

  // ============================================================
  // File Writing Events
  // ============================================================

  /**
   * Emitted before writing files to disk.
   *
   * @param params - Event parameters
   * @param params.files - Array of all files that will be written
   *
   * @remarks
   * This event is triggered before any files are physically written to the filesystem.
   * Use it to prepare output directories or perform pre-write validation.
   *
   * @example
   * ```ts
   * fabric.context.on('files:writing:start', async ({ files }) => {
   *   console.log(`Preparing to write ${files.length} file(s) to disk`)
   * })
   * ```
   */
  'files:writing:start': [{ files: KubbFile.ResolvedFile[] }]

  /**
   * Emitted after writing files to disk.
   *
   * @param params - Event parameters
   * @param params.files - Array of all files that were written
   *
   * @remarks
   * This event is triggered after all files have been successfully written
   * to the filesystem. Use it for post-write cleanup or notifications.
   *
   * @example
   * ```ts
   * fabric.context.on('files:writing:end', async ({ files }) => {
   *   console.log(`Successfully wrote ${files.length} file(s) to disk`)
   * })
   * ```
   */
  'files:writing:end': [{ files: KubbFile.ResolvedFile[] }]
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
