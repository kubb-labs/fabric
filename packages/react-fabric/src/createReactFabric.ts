import { createFabric } from '@kubb/fabric-core'
import type { Fabric, FabricConfig, FabricMode } from '@kubb/fabric-core/types'
import { openDevtools } from './devtools.ts'
import type { Options } from './plugins/reactPlugin.ts'
import { reactPlugin } from './plugins/reactPlugin.ts'

export function createReactFabric(
  config: FabricConfig<Options & { mode?: FabricMode; devtools?: boolean }> = {},
): Fabric<Options & { mode?: FabricMode; devtools?: boolean }> {
  if (config.devtools) {
    openDevtools()
  }

  const fabric = createFabric({ mode: config.mode })

  fabric.use(reactPlugin, {
    stdout: config.stdout,
    stderr: config.stderr,
    debug: config.debug,
    stdin: config.stdin,
  })

  return fabric
}
