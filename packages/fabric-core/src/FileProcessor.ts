import type * as KubbFile from './KubbFile.ts'
import { EventEmitter } from './utils/EventEmitter.ts'
import { write } from './fs.ts'
import pLimit from 'p-limit'
import type { Parser } from './parsers/types.ts'
import { typeScriptParser } from './parsers/typescript.ts'
import { tsxParser } from './parsers/tsx.ts'
import { defaultParser } from './parsers/default.ts'

type FileProcessorEvents = {
  start: [{ files: KubbFile.ResolvedFile[] }]
  finish: [{ files: KubbFile.ResolvedFile[] }]
  'file:start': [{ file: KubbFile.ResolvedFile }]
  'file:finish': [{ file: KubbFile.ResolvedFile }]
}

type ProcessFilesProps = {
  extension?: Record<KubbFile.Extname, KubbFile.Extname | ''>
  dryRun?: boolean
}

type GetSourceOptions = {
  extname?: KubbFile.Extname
}

async function getParser<TMeta extends object = object>(extname: KubbFile.Extname | undefined): Promise<Parser<TMeta>> {
  const parsers: Record<KubbFile.Extname, Parser<any>> = {
    '.ts': typeScriptParser,
    '.js': typeScriptParser,
    '.jsx': tsxParser,
    '.tsx': tsxParser,
    '.json': defaultParser,
  }

  if (!extname) {
    return defaultParser
  }

  const parser = parsers[extname]

  if (!parser) {
    console.warn(`[parser] No parser found for ${extname}, default parser will be used`)
  }

  return parser || defaultParser
}

export async function parseFile(file: KubbFile.ResolvedFile, { extname }: GetSourceOptions = {}): Promise<string> {
  const parser = await getParser(file.extname)

  return parser.print(file, { extname })
}

export class FileProcessor extends EventEmitter<FileProcessorEvents> {
  #limit = pLimit(100)

  constructor(maxListener = 1000) {
    super(maxListener)
    return this
  }

  async run(files: Array<KubbFile.ResolvedFile>, { dryRun, extension }: ProcessFilesProps): Promise<KubbFile.ResolvedFile[]> {
    this.emit('start', { files })

    const promises = files.map((resolvedFile) =>
      this.#limit(async () => {
        const extname = extension?.[resolvedFile.extname] || undefined

        this.emit('file:start', { file: resolvedFile })

        if (!dryRun) {
          const source = await parseFile(resolvedFile, { extname })
          await write(resolvedFile.path, source, { sanity: false })
        }

        this.emit('file:finish', { file: resolvedFile })
      }),
    )

    await Promise.all(promises)

    this.emit('finish', { files })

    return files
  }
}
