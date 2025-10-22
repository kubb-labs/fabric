import { createApp } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

export const app = createApp()

app.addFile({
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

app.addFile({
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

app.use(fsPlugin)

app.write()
