import process from 'node:process'

import path from 'node:path'
import { File, Function, createApp } from '@kubb/react-fabric'

/**
 * Create a file and append JSX
 */
function App() {
  return (
    <File path={path.resolve(__dirname, 'App.tsx')} baseName={'App.tsx'}>
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
  const app = createApp(App)

  app.run()
  await app.write()
}

start()
