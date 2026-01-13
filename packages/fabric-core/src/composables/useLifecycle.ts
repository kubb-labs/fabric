import { RootContext } from '../contexts/RootContext.ts'
import { useContext } from './useContext.ts'

/**
 * `useLifecycle` will return some helpers to exit/restart the generation.
 */
export function useLifecycle() {
  const { exit } = useContext(RootContext, { exit: () => {} })

  return {
    exit,
  }
}
