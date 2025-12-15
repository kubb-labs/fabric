import { definePlugin } from '@kubb/fabric-core/plugins'
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
  render(App: ElementType): Promise<void>
  renderToString(App: ElementType): Promise<string>
  waitUntilExit(): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(App: ElementType): Promise<void>
      renderToString(App: ElementType): Promise<string>
      waitUntilExit(): Promise<void>
    }
  }
}

export const reactPlugin = definePlugin<Options, ExtendOptions>({
  name: 'react',
  install() {},
  inject(ctx, options = {}) {
    const runtime = new Runtime({ fileManager: ctx.fileManager, ...options })

    return {
      async render(App) {
        await runtime.render(createElement(App))
        await ctx.emit('start')
      },
      async renderToString(App) {
        await ctx.emit('start')
        return runtime.renderToString(createElement(App))
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()

        await ctx.emit('end')
      },
    }
  },
})
