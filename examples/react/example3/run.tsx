import path from 'node:path'
import { Const, createFabric, File } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * Create 2 files and write them to the file-system
 */
function App() {
  const namesPath = path.resolve(__dirname, 'gen/name.ts')
  const helloWorldPath = path.resolve(__dirname, 'gen/result.ts')

  return (
    <>
      <File path={namesPath} baseName={'name.ts'}>
        <File.Source>
          <Const export asConst name={'name'}>
            "Lily"
          </Const>
        </File.Source>
      </File>

      <File path={helloWorldPath} baseName={'result.ts'}>
        <File.Import root={helloWorldPath} name={['name']} path={namesPath} />
        <File.Source>
          <Const name={'hello'}>name</Const>
        </File.Source>
      </File>
    </>
  )
}

async function start() {
  const fabric = createFabric()

  fabric.use(fsPlugin)
  fabric.use(reactPlugin)

  await fabric.render(App)

  const files = fabric.files

  console.log('\nFiles: ', files.length)
  await fabric.write()
}

start()
