import type { Fabric } from '@kubb/fabric-core'
import { createFabric } from '@kubb/fabric-core'
import type { FabricConfig, FabricMode } from '@kubb/fabric-core/types'

/**
 * Creates a Fabric instance pre-configured for stc (String Template Components) usage
 * 
 * @example
 * ```ts
 * import { createStcFabric } from '@kubb/stc-fabric'
 * 
 * const fabric = createStcFabric()
 * ```
 */
export function createStcFabric(
  config: FabricConfig<{ mode?: FabricMode }> = {},
): Fabric<{ mode?: FabricMode }> {
  const fabric = createFabric({ mode: config.mode })

  return fabric
}
