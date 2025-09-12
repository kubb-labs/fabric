import { createContext, useContext } from 'react'

import type { KubbFile } from '@kubb/craft-core'
import type { KubbNode } from '../types.ts'
import { RootContext } from './Root.tsx'

type AppContextProps = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly mode: KubbFile.Mode
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

type Props = {
  readonly mode: KubbFile.Mode
  readonly children?: KubbNode
}

export function App({  mode, children }: Props) {
  const { exit } = useContext(RootContext)

  return <AppContext.Provider value={{ exit,  mode }}>{children}</AppContext.Provider>
}

App.Context = AppContext
App.displayName = 'KubbApp'
