import { RootContext } from '../contexts/RootContext.ts'
import { useContext } from './useContext.ts'

/**
 * `useLifecycle` will return some helpers to exit/restart the generation.
 *
 * This hook reads the RootContext and exposes lifecycle helpers (like `exit`)
 * for consumers to programmatically stop generation or perform teardown.
 */
export function useLifecycle() {
  const { exit } = useContext(RootContext)

  return {
    exit,
  }
}
