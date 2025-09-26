import { write } from './fs.ts'
import { createFile, parseFile } from './parser.ts'
import type { Ref } from './reactive/ref.ts'
import type * as KubbFile from './types.ts'

const isFunction = (val: unknown): val is Function => typeof val === 'function'

type Component = any

type PluginInstallFunction<Options = any[]> = Options extends unknown[] ? (app: App, ...options: Options) => any : (app: App, options: Options) => any

export type ObjectPlugin<Options = any[]> = {
  install: PluginInstallFunction<Options>
}
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>

type Renderer = {
  run(): Promise<void> | void
  files: Ref<Array<KubbFile.File>>
  waitUntilExit(): Promise<void>
  output: Ref<string>
}

export type RootRenderFunction<HostElement = unknown> = (container: HostElement) => Renderer

export type Plugin<Options = any[], P extends unknown[] = Options extends unknown[] ? Options : [Options]> = FunctionPlugin<P> | ObjectPlugin<P>

export interface App<_HostElement = unknown> {
  _component: Component
  run(): Promise<void>
  use<Options>(plugin: Plugin<Options>, options: NoInfer<Options>): this
  write(): Promise<void>
  files: Array<KubbFile.File>
  waitUntilExit(): Promise<void>
  output: string
}

export type DefineApp<HostElement> = (rootComponent: Component) => App<HostElement>

export function defineApp<HostElement>(instance: RootRenderFunction<HostElement>): DefineApp<HostElement> {
  function createApp<HostElement>(rootComponent: Component): App<HostElement> {
    const installedPlugins = new WeakSet()
    const { run, waitUntilExit, files, output } = instance(rootComponent)

    const app: App<HostElement> = {
      _component: rootComponent,
      get files() {
        return files.value
      },
      get output() {
        return output.value
      },
      async run() {
        await run()

        await waitUntilExit()
      },
      waitUntilExit,
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
