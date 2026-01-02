import { FileCollector } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'
import { FileCollectorContext } from '../components/File.ts'
import { provide } from '../context.ts'
import type { StcComponent } from '../types.ts'

export type Options = {
  /**
   * Set this to true to always see the result of the render in the console
   */
  debug?: boolean
}

type ExtendOptions = {
  render(component: StcComponent<any>): Promise<void>
  renderToString(component: StcComponent<any>): Promise<string>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(component: StcComponent<any>): Promise<void>
      renderToString(component: StcComponent<any>): Promise<string>
    }
  }
}

export const stcPlugin = definePlugin<Options, ExtendOptions>({
  name: 'stc',
  install() {},
  inject(ctx, options = {}) {
    const fileCollector = new FileCollector()

    return {
      async render(component) {
        await ctx.emit('lifecycle:start')

        provide(FileCollectorContext, fileCollector)

        component({})

        const files = fileCollector.getFiles()
        await ctx.fileManager.add(...files)

        if (options.debug) {
          console.log('Collected files:', files.length)
        }
      },
      async renderToString(component) {
        await ctx.emit('lifecycle:start')

        fileCollector.clear()

        provide(FileCollectorContext, fileCollector)

        const result = component({})

        const files = fileCollector.getFiles()
        await ctx.fileManager.add(...files)

        return result
      },
    }
  },
})
