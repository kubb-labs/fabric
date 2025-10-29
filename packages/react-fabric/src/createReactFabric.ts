import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'
import type { Options } from './plugins/reactPlugin.ts'
import type { FabricConfig, FabricMode } from '@kubb/fabric-core/types'
import { open } from './devtools.ts'

export function createReactFabric(config?: FabricConfig<Options & { mode?: FabricMode; devtools?: boolean }>) {
  const fabric = createFabric(config)

  if (config?.options?.devtools) {
    open()
  }

  fabric.use(reactPlugin, config?.options)

  return fabric
}
