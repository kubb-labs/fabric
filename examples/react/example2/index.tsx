import process from 'node:process'

import path from 'node:path'
import { Const, File, createApp } from '@kubb/react-craft'


/**
 * Create a simple file and write it to the file-system
 */
function Component() {
  return (
    <File path={path.resolve(__dirname, 'result.ts')} baseName={'result.ts'}>
      <File.Source>
        <Const name={'hello'}>"World!"</Const>
      </File.Source>
    </File>
  )
}

async function start() {
  const app = createApp(Component)

  app.mount()
  await app.write()
}

start()
