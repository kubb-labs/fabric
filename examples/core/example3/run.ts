import { createApp } from '@kubb/fabric-core'
import { fsPlugin, barrelPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

export const app = createApp()

app.addFile({
  baseName: 'test.ts',
  path: './example3/gen/hooks/controller/testController.ts',
  sources: [
    {
      name: 'testController',
      value: 'export const testController = 1;',
      isTypeOnly: false,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

app.addFile({
  baseName: 'test.ts',
  path: './example3/gen/hooks/controller/fileController.ts',
  sources: [
    {
      name: 'fileController',
      value: 'export const fileController = 1;',
      isTypeOnly: false,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

app.use(fsPlugin, { clean: { path: './example3/gen' } })
app.use(typescriptParser)
app.use(barrelPlugin, { root: './example3/gen/hooks', mode: 'propagate' })

app.write()
app.writeEntry({ root: './example3/gen', mode: 'named' })
