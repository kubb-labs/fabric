import { AppContext, type AppContextProps } from '../contexts/AppContext.ts'
import { useContext } from './useContext.ts'

/**
 * Accesses the App context with metadata and exit function.
 *
 * Use this composable to access metadata defined in the App component
 * or to exit the rendering process early.
 *
 * @throws Error when no AppContext is available
 *
 * @example
 * ```ts
 * const { meta, exit } = useApp<{ version: string }>()
 * console.log(meta.version)
 * ```
 */
export function useApp<TMeta extends object = object>(): AppContextProps<TMeta> {
  return useContext(AppContext) as AppContextProps<TMeta>
}
