import path from 'node:path'
import { Const, File, createApp } from '@kubb/react-fabric'
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
  const app = createApp()
  app.use(fsPlugin)
  app.use(reactPlugin)

  app.render(App)

  await app.write()
}

start()
