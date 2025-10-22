import { typescriptParser } from './typescriptParser.ts'
import { createParser } from './createParser.ts'

export const tsxParser = createParser({
  name: 'tsx',
  extNames: ['.tsx', '.jsx'],
  install() {},
  async parse(file, options = { extname: '.tsx' }) {
    return typescriptParser.parse(file, options)
  },
})
