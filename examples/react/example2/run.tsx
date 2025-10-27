import path from 'node:path'
import { Const, File, createFabric } from '@kubb/react-fabric'
import { reactPlugin, fsPlugin } from '@kubb/react-fabric/plugins'

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

  fabric.render(App)

  await fabric.write()
}

start()
