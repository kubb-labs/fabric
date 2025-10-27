import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, graphPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

fabric.addFile({
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

fabric.addFile({
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

fabric.use(fsPlugin, {
  clean: { path: './example5/gen' },
})
fabric.use(graphPlugin, { root: './example5', open: false })

fabric.write()
