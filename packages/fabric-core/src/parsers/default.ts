import { createFileParser } from './createFileParser.ts'

export const defaultParser = createFileParser({
  async print(file) {
    return file.sources.map((item) => item.value).join('\n\n')
  },
})
