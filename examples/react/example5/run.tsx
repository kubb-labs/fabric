import path from 'node:path'
import { File, Function, createFabric } from '@kubb/react-fabric'
import { reactPlugin, fsPlugin } from '@kubb/react-fabric/plugins'

/**
 * Create a file and append JSX
 */
function App() {
  return (
    <File path={path.resolve(__dirname, 'gen/App.tsx')} baseName={'App.tsx'}>
      <File.Source>
        <Function export name={'Users'}>
          {`
        return (
          <div className="test" />
          )
        `}
        </Function>
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
