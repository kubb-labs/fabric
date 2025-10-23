import { createPlugin } from './createPlugin.ts'
import { switcher } from 'js-runtime'
import fs from 'fs-extra'
import { resolve } from 'node:path'
import type * as KubbFile from '../KubbFile.ts'

type WriteOptions = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

type Options = {
  /**
   * Optional callback that is invoked whenever a file is written by the plugin.
   * Useful for tests to observe write operations without spying on internal functions.
   */
  onWrite?: (path: string, data: string) => void | Promise<void>
  clean?: {
    path: string
  }
}

type ExtendOptions = {
  write(options?: WriteOptions): Promise<void>
}

export async function write(path: string, data: string, options: { sanity?: boolean } = {}): Promise<string | undefined> {
  if (data.trim() === '') {
    return undefined
  }
  return switcher(
    {
      node: async (path: string, data: string, { sanity }: { sanity?: boolean }) => {
        try {
          const oldContent = await fs.readFile(resolve(path), {
            encoding: 'utf-8',
          })
          if (oldContent?.toString() === data?.toString()) {
            return
          }
        } catch (_err) {
          /* empty */
        }

        await fs.outputFile(resolve(path), data, { encoding: 'utf-8' })

        if (sanity) {
          const savedData = await fs.readFile(resolve(path), {
            encoding: 'utf-8',
          })

          if (savedData?.toString() !== data?.toString()) {
            throw new Error(`Sanity check failed for ${path}\n\nData[${data.length}]:\n${data}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
          }

          return savedData
        }

        return data
      },
      bun: async (path: string, data: string, { sanity }: { sanity?: boolean }) => {
        try {
          await Bun.write(resolve(path), data)

          if (sanity) {
            const file = Bun.file(resolve(path))
            const savedData = await file.text()

            if (savedData?.toString() !== data?.toString()) {
              throw new Error(`Sanity check failed for ${path}\n\nData[${path.length}]:\n${path}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
            }

            return savedData
          }

          return data
        } catch (e) {
          console.error(e)
        }
      },
    },
    'node',
  )(path, data.trim(), options)
}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface App {
    write(options?: WriteOptions): Promise<void>
  }
}

declare global {
  namespace Kubb {
    interface App {
      write(options?: WriteOptions): Promise<void>
    }
  }
}

export const fsPlugin = createPlugin<Options, ExtendOptions>({
  name: 'fs',
  install(app, options) {
    if (options?.clean) {
      fs.removeSync(options.clean.path)
    }

    app.context.events.on('process:progress', async ({ file, source }) => {
      if (options?.onWrite) {
        await options.onWrite(file.path, source)
      }
      await write(file.path, source, { sanity: false })
    })
  },
  inject(app) {
    return {
      async write(
        options = {
          extension: { '.ts': '.ts' },
          dryRun: false,
        },
      ) {
        await app.context.fileManager.write({
          extension: options.extension,
          dryRun: options.dryRun,
          parsers: app.context.installedParsers,
        })
      },
    }
  },
})
