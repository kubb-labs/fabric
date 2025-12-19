import { defineParser } from './defineParser.ts'
import { typescriptParser } from './typescriptParser.ts'

export const tsxParser = defineParser({
  name: 'tsx',
  extNames: ['.tsx', '.jsx'],
  install() {},
  async parse(file, options = { extname: '.tsx' }) {
    return typescriptParser.parse(file, options)
  },
})
