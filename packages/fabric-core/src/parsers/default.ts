import { createParser } from './createParser.ts'

export const defaultParser = createParser({
  name: 'default',
  install() {},
  async print(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})
