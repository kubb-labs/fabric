import { useEffect, useState } from '@kubb/react-fabric'

import path from 'node:path'
import { Const, File, Function, createFabric, useLifecycle } from '@kubb/react-fabric'
import { reactPlugin, fsPlugin } from '@kubb/react-fabric/plugins'

const fetchNames = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['Lily', 'Jan'])
    }, 2000)
  })
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

  fabric.render(App)

  await fabric.waitUntilExit()

  const files = fabric.files

  console.log('\nFiles: ', files.length)
  await fabric.write()
}

start()
