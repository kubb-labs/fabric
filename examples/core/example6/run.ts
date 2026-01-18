import { App, createElement, createFabric, File } from '@kubb/fabric-core'
import { fsPlugin, fsxPlugin } from '@kubb/fabric-core/plugins'

export const fabric = createFabric()

async function run() {
  fabric.use(fsPlugin, {
    clean: { path: './example6/gen' },
  })

  fabric.use(fsxPlugin)

  const component = createElement(App)

  const app = component({
    children() {
      return File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children() {
          return File.Source({ children: () => 'const test = 1;' })
        },
      })
    },
  })

  await fabric.render(app)

  console.log(JSON.stringify(fabric.files, null, 2))

  await fabric.write()
}

run()
