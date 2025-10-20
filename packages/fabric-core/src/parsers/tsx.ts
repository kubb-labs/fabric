import { typeScriptParser } from './typescript.ts'
import { createFileParser } from './parser.ts'

export const tsxParser = createFileParser({
  async print(file, options = { extname: '.tsx' }) {
    return typeScriptParser.print(file, options)
  },
})
