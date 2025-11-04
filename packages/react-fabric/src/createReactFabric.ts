import type { Fabric } from '@kubb/fabric-core'
import { createFabric } from '@kubb/fabric-core'
import type { FabricConfig, FabricMode } from '@kubb/fabric-core/types'
import { open } from './devtools.ts'
import type { Options } from './plugins/reactPlugin.ts'
import { reactPlugin } from './plugins/reactPlugin.ts'

export function createReactFabric(
  config: FabricConfig<Options & { mode?: FabricMode; devtools?: boolean }> = {},
): Fabric<Options & { mode?: FabricMode; devtools?: boolean }> {
  const fabric = createFabric({ mode: config.mode })

  if (config.devtools) {
    open()
  }

  fabric.use(reactPlugin, {
    stdout: config.stdout,
    stderr: config.stderr,
    debug: config.debug,
    stdin: config.stdin,
  })

  return fabric
}
