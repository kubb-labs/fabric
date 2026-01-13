import { AppContext, type AppContextProps } from '../contexts/AppContext.ts'
import { useContext } from './useContext.ts'

/**
 * `useApp` will return the current App with meta and exit function.
 *
 * Throws an error when there is no AppContext available.
 */
export function useApp<TMeta = unknown>(): AppContextProps<TMeta> {
  const app = useContext(AppContext, undefined)

  if (!app) {
    throw new Error('App context should be provided')
  }

  return app as AppContextProps<TMeta>
}
