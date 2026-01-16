import { RootContext, useContext } from '@kubb/fabric-core'

/**
 * Provides lifecycle helpers that integrate with the Fabric runtime. The
 * `exit` helper schedules a call to the RootContext exit function on the
 * next tick to allow React to complete its render cycle first.
 */
export function useLifecycle() {
  const { exit } = useContext(RootContext)

  return {
    exit: () => {
      // need this to let React finish its current render cycle
      setTimeout(() => {
        exit()
      }, 0)
    },
  }
}
