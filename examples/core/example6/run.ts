import { App, createFabric, File } from '@kubb/fabric-core'
import { fsPlugin, fsxPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

async function run() {
  fabric.use(fsPlugin, {
    clean: { path: './example6/gen' },
  })

  fabric.use(fsxPlugin)

  const app = App({
    children() {
      return [
        File({
          baseName: 'file1.ts',
          path: './file1.ts',
          children() {
            return File.Source({ children: () => 'const test = 1;' })
          },
        }),
        File({
          baseName: 'file2.ts',
          path: './file2.ts',
          children() {
            return File.Source({ children: () => 'const test = 2;' })
          },
        }),
      ]
    },
  })

  // app.component()

  await fabric.render(app)

  console.log(JSON.stringify(fabric.files, null, 2))

  await fabric.write()
}

run()
