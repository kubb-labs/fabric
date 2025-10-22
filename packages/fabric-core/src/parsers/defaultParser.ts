import { createParser } from './createParser.ts'

export const defaultParser = createParser({
  name: 'default',
  extNames: ['.json'],
  install() {},
  async parse(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})
