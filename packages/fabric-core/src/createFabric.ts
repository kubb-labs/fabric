import { isFunction } from 'remeda'
import type { Fabric, FabricConfig, FabricContext, FabricEvents, FabricOptions } from './Fabric.ts'
import { FileManager } from './FileManager.ts'
import type * as KubbFile from './KubbFile.ts'
import type { Parser } from './parsers/types.ts'
import type { Plugin } from './plugins/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

/**
 * Creates a new Fabric instance for file generation.
 *
 * The Fabric instance provides methods for registering plugins,
 * adding files, and triggering file generation.
 *
 * @param config - Optional configuration object
 * @returns A new Fabric instance
 *
 * @example
 * ```ts
 * import { createFabric } from '@kubb/fabric-core'
 * import { fsPlugin } from '@kubb/fabric-core/plugins'
 * import { typescriptParser } from '@kubb/fabric-core/parsers'
 *
 * const fabric = createFabric()
 * fabric.use(fsPlugin)
 * fabric.use(typescriptParser)
 *
 * await fabric.addFile({
 *   baseName: 'user.ts',
 *   path: './generated/user.ts',
 *   sources: [{ value: 'export type User = {}', isExportable: true }],
 *    imports: [],
 *   exports: [],
 * })
 *
 * await fabric.write({ extension: { '.ts': '.ts' } })
 * ```
 */
export function createFabric<T extends FabricOptions>(config: FabricConfig<T> = { mode: 'sequential' } as FabricConfig<T>): Fabric<T> {
  const events = new AsyncEventEmitter<FabricEvents>()
  const installedPlugins = new Set<Plugin<any>>()
  const installedParsers = new Map<KubbFile.Extname, Parser<any>>()
  const installedParserNames = new Set<string>()
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
    async upsertFile(...files) {
      await fileManager.upsert(...files)
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
        if (installedParserNames.has(pluginOrParser.name)) {
          console.warn(`Parser "${pluginOrParser.name}" already applied.`)
        } else {
          installedParserNames.add(pluginOrParser.name)
        }

        if (pluginOrParser.extNames) {
          for (const extName of pluginOrParser.extNames) {
            const existing = installedParsers.get(extName)
            if (existing && existing.name !== pluginOrParser.name) {
              console.warn(`Parser "${pluginOrParser.name}" is overriding parser "${existing.name}" for extension "${extName}".`)
            }
            installedParsers.set(extName, pluginOrParser)
          }
        }
      }

      if (isFunction(pluginOrParser.install)) {
        const installer = pluginOrParser.install

        await (installer as any)(context, ...options)
      }

      return fabric
    },
  } as Fabric<T>

  return fabric
}
