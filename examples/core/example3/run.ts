import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

fabric.addFile({
  baseName: 'testController.ts',
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

fabric.addFile({
  baseName: 'fileController.ts',
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

fabric.use(fsPlugin, { clean: { path: './example3/gen' } })
fabric.use(typescriptParser)
fabric.use(barrelPlugin, { root: './example3/gen/hooks', mode: 'named' })

fabric.write()
fabric.writeEntry({ root: './example3/gen', mode: 'named' })
