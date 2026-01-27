import type { TreeNode } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'
import { Runtime } from '../Runtime.tsx'
import type { ComponentNode, FabricReactElement } from '../types.ts'

export type Options = {
  stdout?: NodeJS.WriteStream
  stdin?: NodeJS.ReadStream
  stderr?: NodeJS.WriteStream
  treeNode?: TreeNode<ComponentNode>
  /**
   * Set this to true to always see the result of the render in the console(line per render)
   */
  debug?: boolean
}

type ExtendOptions = {
  render(App: FabricReactElement): Promise<void>
  renderToString(App: FabricReactElement): Promise<string>
  waitUntilExit(): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(App: FabricReactElement): Promise<void>
      renderToString(App: FabricReactElement): Promise<string>
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
        await runtime.render(App)
      },
      async renderToString(App) {
        await ctx.emit('lifecycle:start')
        return runtime.renderToString(App)
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()
      },
    }
  },
})
