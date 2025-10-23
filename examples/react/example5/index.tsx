import path from 'node:path'
import { File, Function, createApp } from '@kubb/react-fabric'
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
  const app = createApp()

  app.use(fsPlugin)
  app.use(reactPlugin)

  app.render(App)

  await app.write()
}

start()
