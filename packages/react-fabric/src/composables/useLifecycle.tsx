import { RootContext, useContext } from '@kubb/fabric-core'

export function useLifecycle() {
  const { exit } = useContext(RootContext, { exit: () => {} })

  return {
    exit: () => {
      // need this to let React finish its current render cycle
      setTimeout(() => {
        exit()
      }, 0)
    },
  }
}
