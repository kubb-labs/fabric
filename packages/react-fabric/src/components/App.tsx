import { AppContext, NodeTreeContext, provide, RootContext, useContext, useNodeTree } from '@kubb/fabric-core'
import type { FabricReactElement, FabricReactNode } from '../types.ts'

export type AppProps<TMeta extends object = object> = {
  /**
   * Metadata associated with the App.
   */
  meta?: TMeta
  /**
   * Children nodes.
   */
  children?: FabricReactNode
}

/**
 * App container containing the AppContext carrying `meta` and an `exit` hook.
 */
export function App<TMeta extends object = object>({ children, ...props }: AppProps<TMeta>): FabricReactElement {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'App', props })

    provide(NodeTreeContext, childTree)
  }

  provide(AppContext, { exit, meta })

  return <>{children}</>
}

App.displayName = 'App'
