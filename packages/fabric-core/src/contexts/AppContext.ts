import { createContext } from '../context.ts'

export type AppContextProps<TMeta = unknown> = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly meta: TMeta | undefined
}

/**
 * Provides app-level metadata and lifecycle hooks (like `exit`) to
 * components and composables within a Fabric runtime.
 */
export const AppContext = createContext<AppContextProps>({
  exit: () => {},
  meta: {},
})
