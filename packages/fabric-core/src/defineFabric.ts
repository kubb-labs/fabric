import { isFunction } from 'remeda'
import type { Fabric, FabricConfig, FabricContext, FabricEvents, FabricOptions } from './Fabric.ts'
import { FileManager } from './FileManager.ts'
import type { Parser } from './parsers/types.ts'
import type { Plugin } from './plugins/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

type RootRenderFunction<TOptions extends FabricOptions> = (fabric: Fabric<TOptions>) => void | Promise<void>

export type DefineFabric<TOptions extends FabricOptions> = (config?: FabricConfig<TOptions>) => Fabric<TOptions>

export function defineFabric<TOptions extends FabricOptions>(instance?: RootRenderFunction<TOptions>): DefineFabric<TOptions> {
  function creator(config?: FabricConfig<TOptions>): Fabric<TOptions> {
    const events = new AsyncEventEmitter<FabricEvents>()
    const installedPlugins = new Set<Plugin<any>>()
    const installedParsers = new Set<Parser<any>>()
    const fileManager = new FileManager({ events })
    const context = {
      events,
      config,
      fileManager,
      installedPlugins,
      installedParsers,
    } as FabricContext<TOptions>

    const fabric = {
      context,
      get files() {
        return fileManager.files
      },
      async addFile(...newFiles) {
        await fileManager.add(...newFiles)
      },
      async use(pluginOrParser, ...options) {
        const args = options

        if (pluginOrParser.type === 'plugin') {
          if (installedPlugins.has(pluginOrParser)) {
            console.warn(`Plugin ${pluginOrParser.name} has already been applied to target fabric.`)
          } else {
            installedPlugins.add(pluginOrParser)
          }

          if (pluginOrParser.inject && isFunction(pluginOrParser.inject)) {
            const injecter = pluginOrParser.inject

            const extraApp = (injecter as any)(fabric, ...args)
            Object.assign(fabric, extraApp)
          }
        }
        if (pluginOrParser.type === 'parser') {
          if (installedParsers.has(pluginOrParser)) {
            console.warn(`Parser ${pluginOrParser.name} has already been applied to target fabric.`)
          } else {
            installedParsers.add(pluginOrParser)
          }
        }

        if (pluginOrParser && isFunction(pluginOrParser.install)) {
          const installer = pluginOrParser.install

          await (installer as any)(fabric, ...args)
        }

        return fabric
      },
    } as Fabric<TOptions>

    if (instance) {
      instance(fabric)
    }

    return fabric
  }

  return creator
}
