import { defineParser } from './defineParser.ts'

export const defaultParser = defineParser({
  name: 'default',
  extNames: ['.json'],
  install() {},
  async parse(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})
