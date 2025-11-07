import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin, progressPlugin } from '@kubb/fabric-core/plugins'

async function timeout(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  }).then((timeout) => {
    clearTimeout(timeout as NodeJS.Timeout)
  })
}

export const fabric = createFabric()

async function run() {
  await fabric.addFile({
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

  await fabric.addFile({
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
      await timeout(200)
    },
    clean: { path: './example4/gen' },
  })
  fabric.use(typescriptParser)
  fabric.use(progressPlugin)

  await fabric.write()
}

run()
