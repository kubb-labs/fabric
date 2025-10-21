import { typeScriptParser } from './typescript.ts'
import { createFileParser } from './createFileParser.ts'

export const tsxParser = createFileParser({
  async print(file, options = { extname: '.tsx' }) {
    return typeScriptParser.print(file, options)
  },
})
