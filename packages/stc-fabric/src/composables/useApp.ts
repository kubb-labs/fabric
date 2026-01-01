import { inject } from '../context.ts'
import { AppContext, type AppContextProps } from '../components/App.ts'

/**
 * `useApp` will return the current App with meta and exit function.
 */
export function useApp<TMeta = unknown>(): AppContextProps<TMeta> {
  const app = inject(AppContext, undefined)

  if (!app) {
    throw new Error('App context should be provided')
  }

  return app as AppContextProps<TMeta>
}
