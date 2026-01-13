import { createContext } from '../context.ts'

export type RootContextProps = {
  /**
   * Exit (unmount) the whole app.
   */
  readonly exit: (error?: Error) => void
}

export const RootContext = createContext<RootContextProps>({
  exit: () => {},
})
