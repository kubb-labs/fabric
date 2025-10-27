import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

export const fabric = createFabric()

fabric.addFile({
  baseName: 'test.ts',
  path: './example1/gen/test.ts',
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

fabric.addFile({
  baseName: 'test2.ts',
  path: './example1/gen/test2.ts',
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

fabric.use(fsPlugin)
fabric.use(typescriptParser)

fabric.write()
