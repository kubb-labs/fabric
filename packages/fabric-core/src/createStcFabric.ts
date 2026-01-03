import { createFabric } from './createFabric.ts'
import type { Fabric } from './Fabric.ts'
import type { StcPluginOptions } from './plugins/stcPlugin.ts'
import { stcPlugin } from './plugins/stcPlugin.ts'
import type { FabricConfig, FabricMode } from './types.ts'

/**
 * Creates a Fabric instance pre-configured for stc (String Template Components) usage
 *
 * @example
 * ```ts
 * import { createStcFabric } from '@kubb/fabric-core'
 *
 * const fabric = createStcFabric()
 * ```
 */
export function createStcFabric(config: FabricConfig<StcPluginOptions & { mode?: FabricMode }> = {}): Fabric<StcPluginOptions & { mode?: FabricMode }> {
  const fabric = createFabric({ mode: config.mode })

  fabric.use(stcPlugin, {
    debug: config.debug,
  })

  return fabric
}
