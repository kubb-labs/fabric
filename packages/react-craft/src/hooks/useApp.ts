import { useContext } from 'react'
import { App, type AppContextProps } from '../components/App.tsx'

/**
 * `useApp` will return the current App with plugin, pluginManager, fileManager and mode.
 */
export function useApp(): AppContextProps {
  const app = useContext(App.Context)

  if (!app) {
    throw new Error('<App /> should be set')
  }

  return app
}
