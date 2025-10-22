import type * as KubbFile from './KubbFile.ts'
import { FileManager } from './FileManager.ts'
import { isPromise } from 'remeda'
import type { Plugin } from './plugins/types.ts'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

const isFunction = (val: unknown): val is Function => typeof val === 'function'

type Component = any

type AppRenderer = {
  render(): Promise<void> | void
  renderToString(): Promise<string> | string
  waitUntilExit(): Promise<void>
}

export type AppContext<TOptions = unknown> = {
  options?: TOptions
  events: AsyncEventEmitter<Events>
  fileManager: FileManager
  addFile(...files: Array<KubbFile.File>): Promise<void>
  files: Array<KubbFile.ResolvedFile>
  clear: () => void
}

export type Install<TOptions = any[]> = TOptions extends unknown[]
  ? (this: AppContext, context: AppContext, ...options: TOptions) => any
  : (this: AppContext, context: AppContext, options: TOptions) => any

type RootRenderFunction<THostElement, TContext extends AppContext> = (this: TContext, container: THostElement, context: TContext) => AppRenderer

type WriteOptions = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

export interface App {
  _component: Component
  render(): Promise<void>
  renderToString(): Promise<string>
  files: Array<KubbFile.ResolvedFile>
  use<TOptions extends any[] | object = any, TMeta extends object = object>(
    pluginOrParser: Plugin<TOptions> | Parser<TOptions, TMeta>,
    ...options: TOptions extends any[] ? NoInfer<TOptions> : [NoInfer<TOptions>]
  ): this
  write(options?: WriteOptions): Promise<void>
  addFile(...files: Array<KubbFile.File>): Promise<void>
  waitUntilExit(): Promise<void>
}

export type DefineApp<TContext extends AppContext> = (rootComponent?: Component, options?: TContext['options']) => App

export type Events = {
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

export function defineApp<THostElement, TContext extends AppContext>(instance: RootRenderFunction<THostElement, TContext>): DefineApp<TContext> {
  function createApp(rootComponent: Component, options?: TContext['options']): App {
    const events = new AsyncEventEmitter<Events>()
    const installedPlugins = new Set<Plugin>()
    const installedParsers = new Set<Parser>()
    const fileManager = new FileManager({ events })
    const context = {
      events,
      options,
      fileManager,
      async addFile(...newFiles) {
        await fileManager.add(...newFiles)
      },
      clear() {
        context.fileManager.clear()
      },
      get files() {
        return fileManager.files
      },
    } as TContext

    const { render, renderToString, waitUntilExit } = instance.call(context, rootComponent, context)

    const app: App = {
      _component: rootComponent,
      async render() {
        if (isPromise(render)) {
          await render()
        } else {
          render()
        }
      },
      async renderToString() {
        return renderToString()
      },
      get files() {
        return fileManager.files
      },
      waitUntilExit,
      addFile: context.addFile,
      async write(
        options = {
          extension: { '.ts': '.ts' },
          dryRun: false,
        },
      ) {
        await fileManager.write({
          extension: options.extension,
          dryRun: options.dryRun,
          parsers: installedParsers,
        })
      },
      use(pluginOrParser, ...options) {
        if (pluginOrParser.type === 'plugin') {
          if (installedPlugins.has(pluginOrParser)) {
            console.warn('Plugin has already been applied to target app.')
          } else {
            installedPlugins.add(pluginOrParser)
          }
        }
        if (pluginOrParser.type === 'parser') {
          if (installedParsers.has(pluginOrParser)) {
            console.warn('Parser has already been applied to target app.')
          } else {
            installedParsers.add(pluginOrParser)
          }
        }

        if (pluginOrParser && isFunction(pluginOrParser.install)) {
          const installer = pluginOrParser.install.bind(context)

          const args = Array.isArray(options) ? options : [options[0]]
          ;(installer as any)(context, ...args)
        }

        return app
      },
    }

    events.emit('start', { app })

    return app
  }

  return createApp
}
