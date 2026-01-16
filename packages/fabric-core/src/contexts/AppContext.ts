import { createContext } from '../context.ts'

export type AppContextProps<TMeta extends object = object> = {
  /**
   * Exit (unmount)
   */
  exit: (error?: Error) => void
  meta: TMeta
}

/**
 * Provides app-level metadata and lifecycle hooks (like `exit`) to
 * components and composables within a Fabric runtime.
 */
export const AppContext = createContext<AppContextProps>({
  exit: () => {},
  meta: {},
})
