import type { ComponentNode } from '../../composables/useNodeTree.ts'
import type { FabricElement } from '../../Fabric.ts'
import { definePlugin } from '../../plugins/definePlugin.ts'
import type { TreeNode } from '../../utils/TreeNode.ts'
import { Runtime } from './Runtime.ts'

export type Options = {
  treeNode?: TreeNode<ComponentNode>
  /**
   * Set this to true to always see the result of the render in the console(line per render)
   */
  debug?: boolean
}

type ExtendOptions = {
  render(App: FabricElement<any>): Promise<string>
  waitUntilExit(): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(App: FabricElement<any>): Promise<string>
      waitUntilExit(): Promise<void>
    }
  }
}

export const fsxPlugin = definePlugin<Options, ExtendOptions>({
  name: 'fsx',
  install() {},
  inject(ctx, options = {}) {
    const runtime = new Runtime({ fileManager: ctx.fileManager, ...options })

    return {
      async render(App) {
        await ctx.emit('lifecycle:start')
        return runtime.render(App)
      },
      async waitUntilExit() {
        await runtime.waitUntilExit()
      },
    }
  },
})
