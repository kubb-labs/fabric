import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

async function run() {
  await fabric.addFile({
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

  console.log(fabric.files)

  await fabric.write()
}

run()
