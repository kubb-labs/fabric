import type * as KubbFile from './KubbFile.ts'
import { write } from './fs.ts'
import pLimit from 'p-limit'
import type { Parser } from './parsers/types.ts'
import { defaultParser } from './parsers/default.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { Events } from './defineApp.ts'
import { typeScriptParser } from './parsers/typescript.ts'
import { tsxParser } from './parsers/tsx.ts'

export type ProcessFilesProps = {
  parsers?: Record<KubbFile.Extname, Parser<any>>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

type GetParseOptions = {
  extname?: KubbFile.Extname
  parsers?: Record<KubbFile.Extname, Parser<any>>
}

type Options = {
  events?: AsyncEventEmitter<Events>
}

export class FileProcessor {
  #limit = pLimit(100)
  events: AsyncEventEmitter<Events>

  constructor({ events = new AsyncEventEmitter<Events>() }: Options = {}) {
    this.events = events

    return this
  }

  get defaultParser(): Record<KubbFile.Extname, Parser<any>> {
    return {
      '.ts': typeScriptParser,
      '.js': typeScriptParser,
      '.jsx': tsxParser,
      '.tsx': tsxParser,
      '.json': defaultParser,
    }
  }

  async parse(file: KubbFile.ResolvedFile, { parsers = this.defaultParser, extname }: GetParseOptions = {}): Promise<string> {
    if (!extname) {
      console.warn(`[parser] No parser found for ${extname}, default parser will be used`)
      return defaultParser.print(file, { extname })
    }

    const parser = parsers[extname]

    if (!parser) {
      console.warn(`[parser] No parser found for ${extname}, default parser will be used`)

      return defaultParser.print(file, { extname })
    }

    return parser.print(file, { extname })
  }

  async run(files: Array<KubbFile.ResolvedFile>, { parsers, dryRun, extension }: ProcessFilesProps = {}): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('process:start', { files })

    let processed = 0
    const total = files.length

    const promises = files.map((resolvedFile, index) =>
      this.#limit(async () => {
        const extname = extension?.[resolvedFile.extname] || undefined

        await this.events.emit('file:start', { file: resolvedFile, index, total })

        await this.events.emit('file:start', { file: resolvedFile, index, total })

        if (!dryRun) {
          const source = await this.parse(resolvedFile, { extname, parsers })
          await write(resolvedFile.path, source, { sanity: false })
        }

        await this.events.emit('process:progress', { file: resolvedFile, processed, percentage: (processed / total) * 100, total })

        await this.events.emit('file:end', { file: resolvedFile, index, total })

        processed++
      }),
    )

    await Promise.all(promises)

    await this.events.emit('process:end', { files })

    return files
  }
}
