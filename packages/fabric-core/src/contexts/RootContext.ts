import { createContext } from '../context.ts'

type RootContextProps = {
  /**
   * Exit (unmount) the whole app.
   */
  readonly exit: (error?: Error) => void
}

/**
 * Provides a top-level lifecycle hook (`exit`) for terminating the Fabric
 * runtime. This context is available at the root of a Fabric app.
 */
export const RootContext = createContext<RootContextProps>({
  exit: () => {},
})
