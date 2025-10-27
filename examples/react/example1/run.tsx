// import '@kubb/react-fabric/devtools'

import { useEffect, useRef, useState } from '@kubb/react-fabric'

import { createFabric, useLifecycle } from '@kubb/react-fabric'
import { reactPlugin } from '@kubb/react-fabric/plugins'
import * as process from 'node:process'

/**
 * Render component that will count down from 5
 */
function App() {
  const timer = useRef<NodeJS.Timer>(null)
  const [counter, setCounter] = useState(5)
  const { exit } = useLifecycle()

  useEffect(() => {
    timer.current = setInterval(() => {
      setCounter((previousCounter) => {
        return previousCounter - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer.current!)
    }
  }, [])

  useEffect(() => {
    if (counter === 0) {
      // trigger unmount
      exit()
      clearInterval(timer.current!)
    }
  }, [counter, exit])

  if (counter === 0) {
    return <>Finished</>
  }

  return <>Counter: {counter}</>
}

const fabric = createFabric()

fabric.use(reactPlugin, { stderr: process.stderr, stdout: process.stdout, stdin: process.stdin })

fabric.render(App)
