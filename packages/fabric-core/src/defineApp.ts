import type * as KubbFile from './KubbFile.ts'
import { FileManager } from './FileManager.ts'
import { isPromise } from 'remeda'
import { FileProcessor } from './FileProcessor.ts'

const isFunction = (val: unknown): val is Function => typeof val === 'function'

type Component = any

type PluginInstallFunction<Options = any[]> = Options extends unknown[] ? (app: App, ...options: Options) => any : (app: App, options: Options) => any

export type ObjectPlugin<Options = any[]> = {
  install: PluginInstallFunction<Options>
}
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>

type AppRenderer = {
  render(): Promise<void> | void
  renderToString(): Promise<string> | string
  waitUntilExit(): Promise<void>
}

export type AppContext<TOptions = unknown> = {
  options?: TOptions
  fileManager: FileManager
  addFile(...files: Array<KubbFile.File>): Promise<void>
  files: Array<KubbFile.ResolvedFile>
  clear: () => void
}

type RootRenderFunction<THostElement, TContext extends AppContext> = (this: TContext, container: THostElement, context: TContext) => AppRenderer

type Plugin<Options = any[], P extends unknown[] = Options extends unknown[] ? Options : [Options]> = FunctionPlugin<P> | ObjectPlugin<P>

type WriteOptions = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

export interface App {
  _component: Component
  render(): Promise<void>
  renderToString(): Promise<string>
  files: Array<KubbFile.ResolvedFile>
  use<Options>(plugin: Plugin<Options>, options: NoInfer<Options>): this
  write(options?: WriteOptions): Promise<void>
  addFile(...files: Array<KubbFile.File>): Promise<void>
  waitUntilExit(): Promise<void>
}

export type DefineApp<TContext extends AppContext> = (rootComponent?: Component, options?: TContext['options']) => App

export function defineApp<THostElement, TContext extends AppContext>(instance: RootRenderFunction<THostElement, TContext>): DefineApp<TContext> {
  function createApp(rootComponent: Component, options?: TContext['options']): App {
    const installedPlugins = new WeakSet()
    const fileManager = new FileManager()
    const fileProcessor = new FileProcessor()
    const context = {
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
        await fileProcessor.run(fileManager.files, {
          extension: options.extension,
          dryRun: options.dryRun,
        })
      },
      use(plugin: Plugin, ...options: any[]) {
        if (installedPlugins.has(plugin)) {
          console.warn('Plugin has already been applied to target app.')
        } else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin)
          plugin.install(app, ...options)
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin)
          plugin(app, ...options)
        }

        return app
      },
    }

    return app
  }

  return createApp
}
