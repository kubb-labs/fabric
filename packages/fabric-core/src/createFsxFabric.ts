import { createFabric } from './createFabric.ts'
import type { Fabric } from './Fabric.ts'
import type { FsxPluginOptions } from './plugins/fsxPlugin.ts'
import { fsxPlugin } from './plugins/fsxPlugin.ts'
import type { FabricConfig, FabricMode } from './types.ts'

/**
 * Creates a Fabric instance pre-configured for fsx (Fabric Syntax eXtension) usage
 *
 * @example
 * ```ts
 * import { createFsxFabric } from '@kubb/fabric-core'
 *
 * const fabric = createFsxFabric()
 * ```
 */
export function createFsxFabric(config: FabricConfig<FsxPluginOptions & { mode?: FabricMode }> = {}): Fabric<FsxPluginOptions & { mode?: FabricMode }> {
  const fabric = createFabric({ mode: config.mode })

  fabric.use(fsxPlugin, {
    debug: config.debug,
  })

  return fabric
}
