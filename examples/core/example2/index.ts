import { createApp } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

export const app = createApp()

app.addFile({
  baseName: 'test.ts',
  path: './example2/gen/test.ts',
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

app.use(fsPlugin)
app.use(typescriptParser)

app.write()
