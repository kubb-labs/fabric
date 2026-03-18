import { FabricContext, NodeTreeContext, provide, RootContext, useContext, useNodeTree } from '@kubb/fabric-core'
import type { FabricReactElement, FabricReactNode } from '../types.ts'

export type FabricProps<TMeta extends object = object> = {
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
 * Fabric container containing the FabricContext carrying `meta` and an `exit` hook.
 */
export function Fabric<TMeta extends object = object>({ children, ...props }: FabricProps<TMeta>): FabricReactElement {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'App', props })

    provide(NodeTreeContext, childTree)
  }

  provide(FabricContext, { exit, meta })

  return <>{children}</>
}

Fabric.displayName = 'Fabric'
