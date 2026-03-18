import { FabricContext, type FabricContextProps } from '../contexts/FabricContext.ts'
import { useContext } from './useContext.ts'

/**
 * Accesses the App context with metadata and exit function.
 *
 * Use this composable to access metadata defined in the App component
 * or to exit the rendering process early.
 *
 * @throws Error when no AppContext is available
 *
 * @example
 * ```ts
 * const { meta, exit } = useFabric<{ version: string }>()
 * console.log(meta.version)
 * ```
 */
export function useFabric<TMeta extends object = object>(): FabricContextProps<TMeta> {
  return useContext(FabricContext) as FabricContextProps<TMeta>
}
