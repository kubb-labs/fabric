import { createContext, inject, useContext } from '../context.ts'
import { RootContext } from './Root.ts'

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

export function App<TMeta = unknown>({ meta, children }: Props<TMeta>): string {
  const { exit } = inject(RootContext, { exit: () => {} })

  // Provide app context
  const appContextValue: AppContextProps<TMeta> = { exit, meta }
  // In stc, we just return children since we don't have a component tree
  // Context is provided via provide() calls before components run
  
  return children || ''
}

App.Context = AppContext
App.displayName = 'KubbApp'

// Export for use with provide/inject
export { AppContext }
