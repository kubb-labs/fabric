import { typeScriptParser } from './typescript.ts'
import { createParser } from './createParser.ts'

export const tsxParser = createParser({
  name: 'tsx',
  install() {},
  async print(file, options = { extname: '.tsx' }) {
    return typeScriptParser.print(file, options)
  },
})
