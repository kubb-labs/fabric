import path from 'node:path'
import { Const, createReactFabric, File, useEffect, useLifecycle, useState } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/react-fabric/plugins'

function DynamicGenerator() {
  const { exit } = useLifecycle()
  const [count, setCount] = useState(0)

  if (count === 3) {
    exit()
  }

  useEffect(() => {
    setCount(3) // Simulate dynamic change
  }, [])

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <File key={i} baseName={`config-${i}.ts`} path={path.resolve(__dirname, `gen/config-${i}.ts`)}>
          <File.Source isExportable>
            <Const name={`CONFIG_${i}`} export>
              {`'value-${i}'`}
            </Const>
          </File.Source>
        </File>
      ))}
    </>
  )
}

async function start() {
  const fabric = createReactFabric()

  fabric.use(fsPlugin, { clean: { path: path.resolve(__dirname, './gen') } })

  await fabric.render(<DynamicGenerator />)

  await fabric.waitUntilExit()

  await fabric.write()
}

start()
