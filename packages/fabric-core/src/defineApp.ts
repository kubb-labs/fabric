import { FileManager } from './FileManager.ts'
import { isFunction } from 'remeda'
import type { Plugin } from './plugins/types.ts'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { AppContext, Component, AppEvents } from './App.ts'

import type { App } from './index.ts'

type RootRenderFunction<TApp extends App> = (app: TApp) => void | Promise<void>

export type DefineApp<TOptions> = (rootComponent?: Component, options?: TOptions) => App

export function defineApp<TOptions = unknown>(instance?: RootRenderFunction<App<TOptions>>): DefineApp<TOptions> {
  function createApp(options?: TOptions): App {
    const events = new AsyncEventEmitter<AppEvents>()
    const installedPlugins = new Set<Plugin>()
    const installedParsers = new Set<Parser>()
    const fileManager = new FileManager({ events })
    const context = {
      events,
      options,
      fileManager,
      installedPlugins,
      installedParsers,
    } as AppContext<TOptions>

    const app = {
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
            console.warn('Plugin has already been applied to target app.')
          } else {
            installedPlugins.add(pluginOrParser)
          }

          if (pluginOrParser.inject && isFunction(pluginOrParser.inject)) {
            const injecter = pluginOrParser.inject

            const extraApp = (injecter as any)(app, ...args)
            Object.assign(app, extraApp)
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
          const installer = pluginOrParser.install

          await (installer as any)(app, ...args)
        }

        return app
      },
    } as App<TOptions>

    if (instance) {
      instance(app)
    }

    return app
  }

  return createApp
}
