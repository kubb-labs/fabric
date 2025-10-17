import { write } from './fs.ts'
import { createFile, parseFile } from './parser.ts'
import { ref } from './reactive/ref.ts'
import type * as KubbFile from './types.ts'
import {isDeepEqual, uniqueWith} from "remeda";

const isFunction = (val: unknown): val is Function => typeof val === 'function'

type Component = any

type PluginInstallFunction<Options = any[]> = Options extends unknown[] ? (app: App, ...options: Options) => any : (app: App, options: Options) => any

export type ObjectPlugin<Options = any[]> = {
  install: PluginInstallFunction<Options>
}
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>

type AppRenderer = {
  render(): Promise<string> | string
  waitUntilExit(): Promise<void>
}

export type AppContext = {
  files: Array<KubbFile.File>
  addFile(...files: Array<KubbFile.File>): Promise<void>
}

type RootRenderFunction<HostElement = unknown> = (this: AppContext, container: HostElement, context: AppContext) => AppRenderer

type Plugin<Options = any[], P extends unknown[] = Options extends unknown[] ? Options : [Options]> = FunctionPlugin<P> | ObjectPlugin<P>

export interface App<_HostElement = unknown> {
  _component: Component
  render(): Promise<void>
  renderToOutput(): Promise<string>
  use<Options>(plugin: Plugin<Options>, options: NoInfer<Options>): this
  write(): Promise<void>
  addFile(...files: Array<KubbFile.File>): Promise<void>
  files: Array<KubbFile.File>
  waitUntilExit(): Promise<void>
}

export type DefineApp<HostElement> = (rootComponent?: Component) => App<HostElement>

export function defineApp<HostElement>(instance: RootRenderFunction<HostElement>): DefineApp<HostElement> {
  function createApp(rootComponent: Component) {
    const installedPlugins = new WeakSet()
    const files = ref<Array<KubbFile.File>>([])
    const context: AppContext = {
      get files() {
        return files.value
      },
      async addFile(...newFiles) {
        files.value.push(...newFiles)
        // try resolving this uniqueWith check
        files.value =  uniqueWith(files.value, isDeepEqual)
      },
    }

    const { render, waitUntilExit } = instance.call(context, rootComponent, context)

    const app: App<HostElement> = {
      _component: rootComponent,
      async render() {
        await render()
      },
      async renderToOutput() {
        return render()
      },
      waitUntilExit,
      get files() {
        return files.value
      },
      addFile: context.addFile,
      async write() {
        for (const file of files.value) {
          const resolvedFile = createFile(file)
          const source = await parseFile(resolvedFile)

          await write(file.path, source)
        }
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
