import { createApp } from '@kubb/fabric-core'
import { fsPlugin, graphPlugin } from '@kubb/fabric-core/plugins'

export const app = createApp()

app.addFile({
  baseName: 'testController.ts',
  path: './example5/gen/hooks/controller/testController.ts',
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
  baseName: 'fileController.ts',
  path: './example5/gen/hooks/controller/fileController.ts',
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
  clean: { path: './example5/gen' },
})
app.use(graphPlugin, { root: './example5', open: false })

app.write()
