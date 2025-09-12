import type { KubbFile } from '@kubb/craft-core'
import { useContext } from 'react'
import { App } from '../components/App.tsx'

type AppResult = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly mode: KubbFile.Mode
}

/**
 * `useApp` will return the current App with plugin, pluginManager, fileManager and mode.
 */
export function useApp(): AppResult {
  const app = useContext(App.Context)

  if (!app) {
    throw new Error('<App /> should be set')
  }

  return {
    mode: app.mode,
    exit: app.exit,
  }
}
