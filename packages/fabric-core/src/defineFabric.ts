import { isFunction } from 'remeda'
import type { Fabric, FabricConfig, FabricContext, FabricEvents, FabricOptions } from './Fabric.ts'
import { FileManager } from './FileManager.ts'
import type { Parser } from './parsers/types.ts'
import type { Plugin } from './plugins/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

/**
 * Function that initializes the root Fabric instance.
 *
 * Used for setting up plugins, parsers, or performing side effects
 * once the Fabric context is ready.
 */
type FabricInitializer<T extends FabricOptions> = (fabric: Fabric<T>) => void | Promise<void>

/**
 * A function returned by {@link defineFabric} that creates a Fabric instance.
 */
export type CreateFabric<T extends FabricOptions> = (config?: FabricConfig<T>) => Fabric<T>

/**
 * Defines a new Fabric factory function.
 *
 * @example
 * export const createFabric = defineFabric((fabric) => {
 *   fabric.use(myPlugin())
 * })
 */
export function defineFabric<T extends FabricOptions>(init?: FabricInitializer<T>): CreateFabric<T> {
  function create(config?: FabricConfig<T>): Fabric<T> {
    const events = new AsyncEventEmitter<FabricEvents>()
    const installedPlugins = new Set<Plugin<any>>()
    const installedParsers = new Set<Parser<any>>()
    const fileManager = new FileManager({ events })

    const context: FabricContext<T> = {
      get files() {
        return fileManager.files
      },
      async addFile(...files) {
        await fileManager.add(...files)
      },
      config,
      fileManager,
      installedPlugins,
      installedParsers,
      on: events.on.bind(events),
      off: events.off.bind(events),
      onOnce: events.onOnce.bind(events),
      removeAll: events.removeAll.bind(events),
      emit: events.emit.bind(events),
    } as FabricContext<T>

    const fabric: Fabric<T> = {
      context,
      get files() {
        return fileManager.files
      },
      async addFile(...files) {
        await fileManager.add(...files)
      },
      async use(pluginOrParser, ...options) {
        if (pluginOrParser.type === 'plugin') {
          if (installedPlugins.has(pluginOrParser)) {
            console.warn(`Plugin "${pluginOrParser.name}" already applied.`)
          } else {
            installedPlugins.add(pluginOrParser)
          }

          if (isFunction(pluginOrParser.inject)) {
            const injecter = pluginOrParser.inject

            const injected = (injecter as any)(context, ...options)
            Object.assign(fabric, injected)
          }
        }

        if (pluginOrParser.type === 'parser') {
          if (installedParsers.has(pluginOrParser)) {
            console.warn(`Parser "${pluginOrParser.name}" already applied.`)
          } else {
            installedParsers.add(pluginOrParser)
          }
        }

        if (isFunction(pluginOrParser.install)) {
          const installer = pluginOrParser.install

          await (installer as any)(context, ...options)
        }

        return fabric
      },
    } as Fabric<T>

    if (init) {
      init(fabric)
    }

    return fabric
  }

  return create
}
