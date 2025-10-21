import type * as KubbFile from '../KubbFile.ts'
import { typeScriptParser } from './typescript.ts'
import { tsxParser } from './tsx.ts'

export type ParserModule<TMeta extends object = object> = {
  /**
   * Convert a file to string
   */
  print: (file: KubbFile.ResolvedFile<TMeta>, options: PrintOptions) => Promise<string>
}

export function createFileParser<TMeta extends object = object>(parser: ParserModule<TMeta>): ParserModule<TMeta> {
  return parser
}

type PrintOptions = {
  extname?: KubbFile.Extname
}

const defaultParser = createFileParser({
  async print(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})

const parsers: Record<KubbFile.Extname, ParserModule<any>> = {
  '.ts': typeScriptParser,
  '.js': typeScriptParser,
  '.jsx': tsxParser,
  '.tsx': tsxParser,
  '.json': defaultParser,
}

type GetSourceOptions = {
  extname?: KubbFile.Extname
}

export async function parseFile(file: KubbFile.ResolvedFile, { extname }: GetSourceOptions = {}): Promise<string> {
  async function getFileParser<TMeta extends object = object>(extname: KubbFile.Extname | undefined): Promise<ParserModule<TMeta>> {
    if (!extname) {
      return defaultParser
    }

    const parser = parsers[extname]

    if (!parser) {
      console.warn(`[parser] No parser found for ${extname}, default parser will be used`)
    }

    return parser || defaultParser
  }

  const parser = await getFileParser(file.extname)

  return parser.print(file, { extname })
}
