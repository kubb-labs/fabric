import { useContext } from '../composables/useContext.ts'
import { createContext, provide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'

export type AppContextProps<TMeta = unknown> = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly meta: TMeta
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

type Props<TMeta = unknown> = {
  readonly meta: TMeta
  readonly children?: string
}

/**
 * Minimal fsx app container — provides an AppContext carrying `meta` and an
 * `exit` hook. In fsx mode this just returns children content.
 */
export function App<TMeta = unknown>({ children, meta }: Props<TMeta>): string {
  const { exit } = useContext(RootContext)
  provide(AppContext, { exit, meta })

  // In fsx, we just return children since we don't have a component tree
  // Context is provided via provide() calls before components run

  return children || ''
}

App.Context = AppContext
App.displayName = 'KubbApp'

// Export for use with provide/inject
export { AppContext }
