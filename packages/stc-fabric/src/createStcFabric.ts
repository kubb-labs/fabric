import type { Fabric } from '@kubb/fabric-core'
import { createFabric } from '@kubb/fabric-core'
import type { FabricConfig, FabricMode } from '@kubb/fabric-core/types'
import type { Options } from './plugins/stcPlugin.ts'
import { stcPlugin } from './plugins/stcPlugin.ts'

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
  config: FabricConfig<Options & { mode?: FabricMode }> = {},
): Fabric<Options & { mode?: FabricMode }> {
  const fabric = createFabric({ mode: config.mode })

  fabric.use(stcPlugin, {
    debug: config.debug,
  })

  return fabric
}
