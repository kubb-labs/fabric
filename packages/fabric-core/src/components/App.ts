import { useContext } from '../composables/useContext.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'

export type AppProps<TMeta extends Object = Object> = {
  /**
   * Metadata associated with the App.
   */
  meta?: TMeta
  /**
   * Children nodes.
   */
  children?: FabricNode
}

/**
 * App container containing the AppContext carrying `meta` and an `exit` hook.
 */
export const App = createComponent('App', ({ children, ...props }: AppProps) => {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'App', props })

    provide(NodeTreeContext, childTree)
  }

  provide(AppContext, { exit, meta })

  return children
})

App.displayName = 'KubbApp'
