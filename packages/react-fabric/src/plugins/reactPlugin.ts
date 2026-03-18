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
  render(Fabric: FabricReactElement): Promise<void>
  renderToString(Fabric: FabricReactElement): Promise<string>
  waitUntilExit(): Promise<void>
  unmount(error?: Error | number | null): void
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(Fabric: FabricReactElement): Promise<void>
      renderToString(Fabric: FabricReactElement): Promise<string>
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
      async render(Fabric) {
        await ctx.emit('lifecycle:start')
        await runtime.render(Fabric)
      },
      async renderToString(Fabric) {
        await ctx.emit('lifecycle:start')
        return runtime.renderToString(Fabric)
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()
      },
      unmount(error) {
        runtime.unmount(error)
        ctx.removeAll()
      },
    }
  },
})
