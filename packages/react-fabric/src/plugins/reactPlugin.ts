import { createPlugin } from '@kubb/fabric-core/plugins'
import { createElement, type ElementType } from 'react'
import { Runtime } from '../Runtime.tsx'

export type Options = {
  stdout?: NodeJS.WriteStream
  stdin?: NodeJS.ReadStream
  stderr?: NodeJS.WriteStream
  /**
   * Set this to true to always see the result of the render in the console(line per render)
   */
  debug?: boolean
}

type ExtendOptions = {
  render(App: ElementType): Promise<void> | void
  renderToString(App: ElementType): Promise<string> | string
  waitUntilExit(): Promise<void>
}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface Fabric {
    render(App: ElementType): Promise<void> | void
    renderToString(App: ElementType): Promise<string> | string
    waitUntilExit(): Promise<void>
  }
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(App: ElementType): Promise<void> | void
      renderToString(App: ElementType): Promise<string> | string
      waitUntilExit(): Promise<void>
    }
  }
}

export const reactPlugin = createPlugin<Options, ExtendOptions>({
  name: 'react',
  install() {},
  inject(app, options = {}) {
    const runtime = new Runtime({ fileManager: app.context.fileManager, ...options })

    return {
      async render(App) {
        runtime.render(createElement(App))
        await app.context.events.emit('start')
      },
      async renderToString(App) {
        await app.context.events.emit('start')
        return runtime.renderToString(createElement(App))
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()

        await app.context.events.emit('end')
      },
    }
  },
})
