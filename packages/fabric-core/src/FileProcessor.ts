import type * as KubbFile from './KubbFile.ts'
import pLimit from 'p-limit'

import type { Parser } from './parsers/types.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { AppEvents, AppMode } from './App.ts'

export type ProcessFilesProps = {
  parsers?: Set<Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
  /**
   * @default 'sequential'
   */
  mode?: AppMode
}

type GetParseOptions = {
  parsers?: Set<Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
}

type Options = {
  events?: AsyncEventEmitter<AppEvents>
}

export class FileProcessor {
  #limit = pLimit(100)
  events: AsyncEventEmitter<AppEvents>

  constructor({ events = new AsyncEventEmitter<AppEvents>() }: Options = {}) {
    this.events = events

    return this
  }

  async parse(file: KubbFile.ResolvedFile, { parsers, extension }: GetParseOptions = {}): Promise<string> {
    const parseExtName = extension?.[file.extname] || undefined

    if (!parsers) {
      console.warn('No parsers provided, using default parser. If you want to use a specific parser, please provide it in the options.')

      return defaultParser.parse(file, { extname: parseExtName })
    }

    if (!file.extname) {
      return defaultParser.parse(file, { extname: parseExtName })
    }

    let parser: Parser | undefined
    for (const item of parsers) {
      if (item.extNames?.includes(file.extname)) {
        parser = item
        break
      }
    }

    if (!parser) {
      return defaultParser.parse(file, { extname: parseExtName })
    }

    return parser.parse(file, { extname: parseExtName })
  }

  async run(
    files: Array<KubbFile.ResolvedFile>,
    { parsers, mode = 'sequential', dryRun, extension }: ProcessFilesProps = {},
  ): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('process:start', { files })

    let processed = 0
    const total = files.length

    const processOne = async (resolvedFile: KubbFile.ResolvedFile, index: number) => {
      const percentage = (processed / total) * 100

      await this.events.emit('file:start', { file: resolvedFile, index, total })

      const source = dryRun ? undefined : await this.parse(resolvedFile, { extension, parsers })

      await this.events.emit('process:progress', {
        file: resolvedFile,
        source,
        processed,
        percentage,
        total,
      })

      processed++

      await this.events.emit('file:end', { file: resolvedFile, index, total })
    }

    if (mode === 'sequential') {
      async function* asyncFiles() {
        for (let index = 0; index < files.length; index++) {
          yield [files[index], index] as const
        }
      }

      for await (const [file, index] of asyncFiles()) {
        if (file) {
          await processOne(file, index)
        }
      }
    } else {
      const promises = files.map((resolvedFile, index) => this.#limit(() => processOne(resolvedFile, index)))
      await Promise.all(promises)
    }

    await this.events.emit('process:end', { files })

    return files
  }
}
