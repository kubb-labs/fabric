import { createContext } from '../context.ts'

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

export function App<TMeta = unknown>({ children }: Props<TMeta>): string {
  // In stc, we just return children since we don't have a component tree
  // Context is provided via provide() calls before components run

  return children || ''
}

App.Context = AppContext
App.displayName = 'KubbApp'

// Export for use with provide/inject
export { AppContext }
