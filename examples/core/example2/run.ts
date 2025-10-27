import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

export const fabric = createFabric()

fabric.addFile({
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

fabric.use(fsPlugin, { clean: { path: './example2/gen' } })
fabric.use(typescriptParser)

fabric.write()
