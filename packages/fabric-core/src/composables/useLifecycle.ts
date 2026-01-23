import { RootContext } from '../contexts/RootContext.ts'
import { useContext } from './useContext.ts'

/**
 * Accesses lifecycle helpers for controlling generation flow.
 *
 * Use this composable to exit the rendering process early or perform
 * cleanup operations.
 *
 * @returns Object with lifecycle methods (exit)
 *
 * @example
 * ```ts
 * const { exit } = useLifecycle()
 *
 * // Stop generation on error
 * if (invalidData) {
 *   exit(new Error('Invalid data'))
 * }
 * ```
 */
export function useLifecycle() {
  const { exit } = useContext(RootContext)

  return {
    exit,
  }
}
