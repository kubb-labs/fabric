import type * as KubbFile from './KubbFile.ts'
import pLimit from 'p-limit'
import path from 'node:path'

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

  constructor({ events = new AsyncEventEmitter<AppEvents>() }: Options = {}) {
    this.events = events

    return this
  }

  get #defaultParser(): Set<Parser> {
    return new Set<Parser>([typescriptParser, tsxParser, defaultParser])
  }

  async parse(file: KubbFile.ResolvedFile, { parsers = this.#defaultParser, extension }: GetParseOptions = {}): Promise<string> {
    const extname = extension?.[file.extname] || (path.extname(file.path) as KubbFile.Extname)

    if (!extname) {
      return defaultParser.parse(file, { extname })
    }

    const parser = [...parsers].find((item) => item.extNames?.includes(extname))

    if (!parser) {
      return defaultParser.parse(file, { extname })
    }

    return parser.parse(file, { extname })
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
          await this.events.emit('process:progress', { file: resolvedFile, source, processed, percentage: (processed / total) * 100, total })
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
