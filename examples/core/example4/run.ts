import { createApp } from '@kubb/fabric-core'
import { fsPlugin, progressPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

export const app = createApp()

app.addFile({
  baseName: 'test.ts',
  path: './example4/gen/hooks/controller/testController.ts',
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
  path: './example4/gen/hooks/controller/fileController.ts',
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

app.use(fsPlugin, {
  dryRun: true,
  async onBeforeWrite() {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  },
  clean: { path: './example4/gen' },
})
app.use(typescriptParser)
app.use(progressPlugin)

app.write()
