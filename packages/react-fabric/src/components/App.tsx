import { createContext, useContext } from 'react'
import type { KubbNode } from '../types.ts'
import { RootContext } from './Root.tsx'

export type AppContextProps<TMeta = unknown> = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly meta: TMeta
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

type Props<TMeta = unknown> = {
  readonly children?: KubbNode
  readonly meta: TMeta
}

export function App<TMeta = unknown>({ meta, children }: Props<TMeta>) {
  const { exit } = useContext(RootContext)

  return <AppContext.Provider value={{ exit, meta }}>{children}</AppContext.Provider>
}

App.Context = AppContext
App.displayName = 'KubbApp'
