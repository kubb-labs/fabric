import { definePlugin } from '@kubb/fabric-core/plugins'
import { createElement, type ElementType } from 'react'
import { Runtime } from '../Runtime.tsx'
import type { KubbElement } from '../types'

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
  render(App: KubbElement | ElementType): Promise<void>
  renderToString(App: KubbElement | ElementType): Promise<string>
  waitUntilExit(): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(App: KubbElement | ElementType): Promise<void>
      renderToString(App: KubbElement | ElementType): Promise<string>
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
        await ctx.emit('lifecycle:start')
        await runtime.render(createElement(App as unknown as ElementType))
      },
      async renderToString(App) {
        await ctx.emit('lifecycle:start')
        return runtime.renderToString(createElement(App as unknown as ElementType))
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()
      },
    }
  },
})
