import path from 'node:path'
import { Const, createFabric, File, Function, useEffect, useLifecycle, useState } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

async function timeout(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  }).then((timeout) => {
    clearTimeout(timeout as NodeJS.Timeout)
  })
}

const fetchNames = async (): Promise<string[]> => {
  await timeout(2000)

  return ['Lily', 'Jan']
}

/**
 * Create a file and append data based on a promise
 */
function App() {
  const [names, setNames] = useState<string[]>([])
  const { exit } = useLifecycle()

  useEffect(() => {
    fetchNames().then((newNames) => {
      setNames(newNames)

      exit()
    })
  }, [])

  if (!names.length) {
    return null
  }

  return (
    <File path={path.resolve(__dirname, 'gen/result.ts')} baseName={'result.ts'}>
      <File.Source>
        <Const name={'names'}>"{names.join(' and ')}"</Const>
        <br />
        <Function.Arrow name={'getNames'} export singleLine>
          names
        </Function.Arrow>
        <Function.Arrow name={'getFirstChar'} export>
          return names.charAt(0)
        </Function.Arrow>
        <br />
        <Function
          name={'getNamesTyped'}
          export
          returnType={'TNames'}
          JSDoc={{
            comments: ['Returns the names'],
          }}
          generics={['TNames extends string']}
        >
          return names as TNames
        </Function>
      </File.Source>
    </File>
  )
}

async function start() {
  const fabric = createFabric()

  fabric.use(fsPlugin)
  fabric.use(reactPlugin)

  await fabric.render(App)

  await fabric.waitUntilExit()

  const files = fabric.files

  console.log('\nFiles: ', files.length)
  await fabric.write()
}

start()
