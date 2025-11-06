import pLimit from 'p-limit'
import type { FabricEvents, FabricMode } from './Fabric.ts'
import type * as KubbFile from './KubbFile.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

export type ProcessFilesProps = {
  parsers?: Set<Parser>
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
  /**
   * @default 'sequential'
   */
  mode?: FabricMode
}

type GetParseOptions = {
  parsers?: Set<Parser>
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

  static #buildParserMap(parsers?: Set<Parser>): Map<KubbFile.Extname, Parser> {
    const parserMap = new Map<KubbFile.Extname, Parser>()
    if (!parsers) return parserMap

    for (const parser of parsers) {
      if (!parser.extNames) continue
      for (const ext of parser.extNames) {
        parserMap.set(ext, parser)
      }
    }

    return parserMap
  }

  async parse(file: KubbFile.ResolvedFile, { parsers, extension }: GetParseOptions = {}): Promise<string> {
    const parseExtName = extension?.[file.extname] || undefined

    if (!parsers || parsers.size === 0) {
      console.warn('No parsers provided, using default parser.')
      return defaultParser.parse(file, { extname: parseExtName })
    }

    if (!file.extname) {
      return defaultParser.parse(file, { extname: parseExtName })
    }

    const parserMap = FileProcessor.#buildParserMap(parsers)
    const parser = parserMap.get(file.extname)

    return parser ? parser.parse(file, { extname: parseExtName }) : defaultParser.parse(file, { extname: parseExtName })
  }

  async run(
    files: Array<KubbFile.ResolvedFile>,
    { parsers, mode = 'sequential', dryRun, extension }: ProcessFilesProps = {},
  ): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('process:start', { files })

    const total = files.length
    let processed = 0

    const parserMap = FileProcessor.#buildParserMap(parsers)

    const processOne = async (resolvedFile: KubbFile.ResolvedFile, index: number) => {
      const percentage = (processed / total) * 100

      await this.events.emit('file:start', { file: resolvedFile, index, total })

      const source = dryRun ? undefined : await this.parse(resolvedFile, { extension, parsers: new Set(parserMap.values()) })

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
