import process from 'node:process'
import { useEffect, useState } from '@kubb/react-fabric'

import path from 'node:path'
import { Const, File, Function, createApp, useLifecycle } from '@kubb/react-fabric'

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

  return (
    <File path={path.resolve(__dirname, 'result.ts')} baseName={'result.ts'}>
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
  const app = createApp(App)

  app.run()

  await app.waitUntilExit()

  console.log('\nFiles: ', app.files.length)
  await app.write()
}

start()
