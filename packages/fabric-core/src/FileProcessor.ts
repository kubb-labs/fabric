import pLimit from 'p-limit'
import type { FabricEvents, FabricMode } from './Fabric.ts'
import type * as KubbFile from './KubbFile.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

export type ProcessFilesProps = {
  parsers?: Map<KubbFile.Extname, Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
  /**
   * @default 'sequential'
   */
  mode?: FabricMode
}

type GetParseOptions = {
  parsers?: Map<KubbFile.Extname, Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
}

type Options = {
  events?: AsyncEventEmitter<FabricEvents>
}

export class FileProcessor {
  #limit = pLimit(100)
  events: AsyncEventEmitter<FabricEvents>

  constructor({ events = new AsyncEventEmitter<FabricEvents>() }: Options = {}) {
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

    const parser = parsers.get(file.extname)

    if (!parser) {
      return defaultParser.parse(file, { extname: parseExtName })
    }

    return parser.parse(file, { extname: parseExtName })
  }

  async run(
    files: Array<KubbFile.ResolvedFile>,
    { parsers, mode = 'sequential', dryRun, extension }: ProcessFilesProps = {},
  ): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('files:processing:start', files)

    const total = files.length
    let processed = 0

    const processOne = async (resolvedFile: KubbFile.ResolvedFile, index: number) => {
      await this.events.emit('file:processing:start', resolvedFile, index, total)

      const source = dryRun ? undefined : await this.parse(resolvedFile, { extension, parsers })

      const currentProcessed = ++processed
      const percentage = (currentProcessed / total) * 100

      await this.events.emit('file:processing:update', {
        file: resolvedFile,
        source,
        processed: currentProcessed,
        percentage,
        total,
      })

      await this.events.emit('file:processing:end', resolvedFile, index, total)
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

    await this.events.emit('files:processing:end', files)

    return files
  }
}
