import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin, progressPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

fabric.addFile({
  baseName: 'testController.ts',
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

fabric.addFile({
  baseName: 'fileController.ts',
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

fabric.use(fsPlugin, {
  dryRun: true,
  async onBeforeWrite() {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  },
  clean: { path: './example4/gen' },
})
fabric.use(typescriptParser)
fabric.use(progressPlugin)

fabric.write()
