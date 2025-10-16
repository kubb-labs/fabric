// import '@kubb/react-fabric/devtools'

import { useEffect, useRef, useState } from '@kubb/react-fabric'

import { Text, createApp, useLifecycle } from '@kubb/react-fabric'

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
    return <Text indentSize={2}>Finished</Text>
  }

  return <Text>Counter: {counter}</Text>
}

const app = createApp(App)

app.run()
