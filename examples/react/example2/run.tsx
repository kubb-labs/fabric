import path from 'node:path'
import { Const, createFabric, File } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * Create a simple file and write it to the file-system
 */
function App() {
  return (
    <File path={path.resolve(__dirname, 'gen/result.ts')} baseName={'result.ts'}>
      <File.Source>
        <Const name={'hello'}>"World!"</Const>
      </File.Source>
    </File>
  )
}

async function start() {
  const fabric = createFabric()
  fabric.use(fsPlugin)
  fabric.use(reactPlugin)

  await fabric.render(App)

  await fabric.write()
}

start()
