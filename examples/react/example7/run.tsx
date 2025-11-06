import path from 'node:path'
import { createReactFabric, File } from '@kubb/react-fabric'
import { fsPlugin, graphPlugin, progressPlugin } from '@kubb/react-fabric/plugins'

async function timeout(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  }).then((timeout) => {
    clearTimeout(timeout as NodeJS.Timeout)
  })
}

/**
 * Create a file and append JSX
 */
function App() {
  return (
    <File path={path.resolve(__dirname, 'gen/HelloWorld.tsx')} baseName={'HelloWorld.tsx'}>
      <File.Source>const test = 2</File.Source>
    </File>
  )
}

async function start() {
  const fabric = createReactFabric({ devtools: false })

  fabric.use(fsPlugin, {
    async onBeforeWrite() {
      await timeout(1000)
    },
    clean: { path: path.resolve(__dirname, './gen') },
  })
  fabric.use(progressPlugin)
  fabric.use(graphPlugin, { root: path.resolve(__dirname, './gen'), open: false })

  await fabric.render(App)
  await fabric.write()
}

start()
