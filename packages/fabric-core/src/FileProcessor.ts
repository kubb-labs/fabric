import type * as KubbFile from './KubbFile.ts'
import pLimit from 'p-limit'

import type { Parser } from './parsers/types.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { AppEvents } from './App.ts'
import { typescriptParser } from './parsers/typescriptParser.ts'
import { tsxParser } from './parsers/tsxParser.ts'

export type ProcessFilesProps = {
  parsers?: Set<Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
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
  readonly #defaultParsers: Set<Parser>

  constructor({ events = new AsyncEventEmitter<AppEvents>() }: Options = {}) {
    this.events = events
    this.#defaultParsers = new Set<Parser>([typescriptParser, tsxParser, defaultParser])

    return this
  }

  async parse(file: KubbFile.ResolvedFile, { parsers = this.#defaultParsers, extension }: GetParseOptions = {}): Promise<string> {
    const parseExtName = extension?.[file.extname] || undefined

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

  async run(files: Array<KubbFile.ResolvedFile>, { parsers, dryRun, extension }: ProcessFilesProps = {}): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('process:start', { files })

    let processed = 0
    const total = files.length

    const promises = files.map((resolvedFile, index) =>
      this.#limit(async () => {
        await this.events.emit('file:start', { file: resolvedFile, index, total })

        if (!dryRun) {
          const source = await this.parse(resolvedFile, { extension, parsers })
          const nextProcessed = processed + 1
          const percentage = (nextProcessed / total) * 100
          processed = nextProcessed
          await this.events.emit('process:progress', { file: resolvedFile, source, processed, percentage, total })
        }

        await this.events.emit('file:end', { file: resolvedFile, index, total })

        processed++
      }),
    )

    await Promise.all(promises)

    await this.events.emit('process:end', { files })

    return files
  }
}
