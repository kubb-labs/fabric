import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'
import type { Options } from './plugins/reactPlugin.ts'
import type { AppMode } from '@kubb/fabric-core/types'
import { open } from './devtools.ts'

export function createReactFabric(options?: Options & { mode?: AppMode; devtools?: boolean }) {
  const fabric = createFabric({ mode: options?.mode })

  if (options?.devtools) {
    open()
  }

  fabric.use(reactPlugin, options)

  return fabric
}
