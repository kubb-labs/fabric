import path from 'node:path'
import { File, createApp } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * Create a file and append JSX
 */
function App1() {
  return (
    <File path={path.resolve(__dirname, 'gen/test.ts')} baseName={'test.ts'}>
      <File.Source>const test = 1</File.Source>
    </File>
  )
}

function App2() {
  return (
    <File path={path.resolve(__dirname, 'gen/test2.ts')} baseName={'test2.ts'}>
      <File.Source>const test2 = 2</File.Source>
    </File>
  )
}

async function start() {
  const app = createApp()

  app.use(fsPlugin, { clean: { path: path.resolve(__dirname, './gen') } })
  app.use(reactPlugin)

  app.render(App1)
  app.render(App2)

  await app.write()
}

start()
