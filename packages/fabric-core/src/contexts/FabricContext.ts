import { createContext } from '../context.ts'

export type FabricContextProps<TMeta extends object = object> = {
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
export const FabricContext = createContext<FabricContextProps>({
  exit: () => {},
  meta: {},
})
