import { AppContext, type AppContextProps } from '../contexts/AppContext.ts'
import { useContext } from './useContext.ts'

/**
 * `useApp` will return the current App with meta and exit function.
 *
 * Throws an error when there is no AppContext available.
 */
export function useApp<TMeta = unknown>(): AppContextProps<TMeta> {
  return useContext(AppContext) as AppContextProps<TMeta>
}
