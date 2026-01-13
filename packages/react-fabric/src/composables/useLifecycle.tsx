import { inject, RootContext } from '@kubb/fabric-core'

export function useLifecycle() {
  const { exit } = inject(RootContext, { exit: () => {} })

  return {
    exit: () => {
      // need this to let React finish its current render cycle
      setTimeout(() => {
        exit()
      }, 0)
    },
  }
}
