import { createContext } from '../context.ts'

export type AppContextProps<TMeta = unknown> = {
  /**
   * Exit (unmount)
   */
  readonly exit: (error?: Error) => void
  readonly meta: TMeta
}

export const AppContext = createContext<AppContextProps | undefined>(undefined)
