import path from 'node:path'
import { createReactFabric, File } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/react-fabric/plugins'

/**
 * Create a file and append JSX
 */
const App1 = (
  <File path={path.resolve(__dirname, 'gen/test.ts')} baseName={'test.ts'}>
    <File.Source>const test = 1</File.Source>
  </File>
)

const App2 = (
  <File path={path.resolve(__dirname, 'gen/test2.ts')} baseName={'test2.ts'}>
    <File.Source>const test2 = 2</File.Source>
  </File>
)

async function start() {
  const fabric = createReactFabric({ devtools: false })

  fabric.use(fsPlugin, { clean: { path: path.resolve(__dirname, './gen') } })

  await fabric.render(App1)
  await fabric.render(App2)

  await fabric.write()
}

start()
