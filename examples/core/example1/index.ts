import { createApp } from '@kubb/fabric-core'

export const example1 = createApp()

example1.addFile({
  baseName: 'test.ts',
  path: './example1/test.ts',
  sources: [
    {
      name: 'test',
      value: 'const test = 1;',
      isTypeOnly: false,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

example1.addFile({
  baseName: 'test2.ts',
  path: './example1/test2.ts',
  sources: [
    {
      name: 'test',
      value: 'const test2 = 2;',
      isTypeOnly: false,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

example1.write()
