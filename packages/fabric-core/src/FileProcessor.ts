import type * as KubbFile from './KubbFile.ts'
import pLimit from 'p-limit'
import type { Parser } from './parsers/types.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import type { Events } from './defineApp.ts'
import { typeScriptParser } from './parsers/typeScriptParser.ts'
import { tsxParser } from './parsers/tsxParser.ts'

export type ProcessFilesProps = {
  parsers?: Set<Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

type GetParseOptions = {
  parsers?: Set<Parser>
  extname?: KubbFile.Extname
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

  get #defaultParser(): Set<Parser> {
    console.warn(`[parser] using default parsers, please consider using the "use" method to add custom parsers.`)

    return new Set<Parser>([typeScriptParser, tsxParser, defaultParser])
  }

  async parse(file: KubbFile.ResolvedFile, { parsers = this.#defaultParser, extname }: GetParseOptions = {}): Promise<string> {
    if (!extname) {
      console.warn(`[parser] No extname found, default parser will be used`)
      return defaultParser.parse(file, { extname })
    }

    const parser = [...parsers].find((item) => item.extNames?.includes(extname))

    if (!parser) {
      console.warn(`[parser] No parser found for ${extname}, default parser will be used`)

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
        const extname = extension?.[resolvedFile.extname] || undefined

        await this.events.emit('file:start', { file: resolvedFile, index, total })

        if (!dryRun) {
          const source = await this.parse(resolvedFile, { extname, parsers })
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
