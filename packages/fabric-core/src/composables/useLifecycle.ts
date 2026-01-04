import { RootContext } from '../components/Root.ts'
import { inject } from '../context.ts'

/**
 * `useLifecycle` will return some helpers to exit/restart the generation.
 */
export function useLifecycle() {
  const { exit } = inject(RootContext, { exit: () => {} })

  return {
    exit: () => {
      // In fsx, we call exit directly without setTimeout since we don't have React's lifecycle
      exit()
    },
  }
}
