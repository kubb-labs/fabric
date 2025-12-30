import { resolve } from 'node:path'
import fs from 'fs-extra'
import type * as KubbFile from '../KubbFile.ts'
import { definePlugin } from './definePlugin.ts'

type WriteOptions = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
}

type Options = {
  dryRun?: boolean
  /**
   * Optional callback that is invoked whenever a file is written by the plugin.
   * Useful for tests to observe write operations without spying on internal functions.
   */
  onBeforeWrite?: (path: string, data: string | undefined) => void | Promise<void>
  clean?: {
    path: string
  }
}

type ExtendOptions = {
  write(options?: WriteOptions): Promise<void>
}

export async function write(path: string, data: string | undefined, options: { sanity?: boolean } = {}): Promise<string | undefined> {
  if (typeof Bun !== 'undefined') {
    if (!data || data?.trim() === '') {
      return undefined
    }

    await Bun.write(resolve(path), data.trim())

    if (options?.sanity) {
      const file = Bun.file(resolve(path))
      const savedData = await file.text()

      if (savedData?.toString() !== data?.toString()) {
        throw new Error(`Sanity check failed for ${path}\n\nData[${data.length}]:\n${data}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
      }

      return savedData
    }

    return data
  }

  if (!data || data?.trim() === '') {
    return undefined
  }

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

  await fs.outputFile(resolve(path), data.trim(), { encoding: 'utf-8' })

  if (options?.sanity) {
    const savedData = await fs.readFile(resolve(path), {
      encoding: 'utf-8',
    })

    if (savedData?.toString() !== data?.toString()) {
      throw new Error(`Sanity check failed for ${path}\n\nData[${data.length}]:\n${data}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
    }

    return savedData
  }

  return data
}

declare global {
  namespace Kubb {
    interface Fabric {
      write(options?: WriteOptions): Promise<void>
    }
  }
}

export const fsPlugin = definePlugin<Options, ExtendOptions>({
  name: 'fs',
  install(ctx, options = {}) {
    if (options.clean) {
      fs.removeSync(options.clean.path)
    }

    ctx.on('file:processing:update', async ({ file, source }) => {
      if (options.onBeforeWrite) {
        await options.onBeforeWrite(file.path, source)
      }
      await write(file.path, source, { sanity: false })
    })
  },
  inject(ctx, { dryRun } = {}) {
    return {
      async write(
        options = {
          extension: { '.ts': '.ts' },
        },
      ) {
        await ctx.fileManager.write({
          mode: ctx.config.mode,
          extension: options.extension,
          dryRun,
          parsers: ctx.installedParsers,
        })

        await ctx.emit('lifecycle:end')
      },
    }
  },
})
