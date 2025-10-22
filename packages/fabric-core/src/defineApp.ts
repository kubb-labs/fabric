import { FileManager } from './FileManager.ts'
import { isFunction, isPromise } from 'remeda'
import type { Plugin } from './plugins/types.ts'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { App, AppContext, Component, AppEvents } from './App.ts'

type AppRenderer = {
  render(): Promise<void> | void
  renderToString(): Promise<string> | string
  waitUntilExit(): Promise<void>
}

type RootRenderFunction<THostElement, TContext extends AppContext> = (this: TContext, container: THostElement, context: TContext) => AppRenderer

export type DefineApp<TContext extends AppContext> = (rootComponent?: Component, options?: TContext['options']) => App

export function defineApp<THostElement, TContext extends AppContext>(instance: RootRenderFunction<THostElement, TContext>): DefineApp<TContext> {
  function createApp(rootComponent: Component, options?: TContext['options']): App {
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
      async addFile(...newFiles) {
        await fileManager.add(...newFiles)
      },
      clear() {
        fileManager.clear()
      },
      get files() {
        return fileManager.files
      },
    } as TContext

    const { render, renderToString, waitUntilExit } = instance.call(context, rootComponent, context)

    const app = {
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
      async addFile(...newFiles) {
        await fileManager.add(...newFiles)
      },
      use(pluginOrParser, ...options) {
        const args = Array.isArray(options) ? options : [options[0]]

        if (pluginOrParser.type === 'plugin') {
          if (installedPlugins.has(pluginOrParser)) {
            console.warn('Plugin has already been applied to target app.')
          } else {
            installedPlugins.add(pluginOrParser)
          }

          if (pluginOrParser.override && isFunction(pluginOrParser.override)) {
            const overrider = pluginOrParser.override

            const extraApp = (overrider as any)(app, context, ...args)
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

          ;(installer as any)(app, context, ...args)
        }

        return app
      },
    } as App

    events.emit('start', { app })

    return app
  }

  return createApp
}
