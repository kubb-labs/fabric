import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { devtoolsPlugin } from '@kubb/fabric-devtools'

export const fabric = createFabric()

// Add the logger plugin with WebSocket support
fabric.use(loggerPlugin, { websocket: true, progress: true })

// Add the devtools plugin to start the UI
fabric.use(devtoolsPlugin, { open: true })

// Add multiple files to generate events
for (let i = 1; i <= 10; i++) {
  fabric.addFile({
    baseName: `file${i}.ts`,
    path: `./example6/gen/file${i}.ts`,
    sources: [
      {
        name: `test${i}`,
        value: `export const test${i} = ${i};`,
        isTypeOnly: false,
        isExportable: true,
        isIndexable: true,
      },
    ],
    imports: [],
    exports: [],
  })
}

fabric.use(fsPlugin)
fabric.use(typescriptParser)

fabric.write()
