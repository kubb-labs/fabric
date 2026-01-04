import { FileCollectorContext } from '../components/File.ts'
import { provide } from '../context.ts'
import { FileCollector } from '../FileCollector.ts'
import type { FsxComponent } from '../types.ts'
import { definePlugin } from './definePlugin.ts'

export type FsxPluginOptions = {
  /**
   * Set this to true to always see the result of the render in the console
   */
  debug?: boolean
}

type ExtendOptions = {
  render(component: FsxComponent<any>): Promise<void>
  renderToString(component: FsxComponent<any>): Promise<string>
}

declare global {
  namespace Kubb {
    interface Fabric {
      render(component: FsxComponent<any>): Promise<void>
      renderToString(component: FsxComponent<any>): Promise<string>
    }
  }
}

export const fsxPlugin = definePlugin<FsxPluginOptions, ExtendOptions>({
  name: 'fsx',
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
