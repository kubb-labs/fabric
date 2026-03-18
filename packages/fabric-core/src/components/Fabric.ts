import { useContext } from '../composables/useContext.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { FabricContext } from '../contexts/FabricContext.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'

export type FabricProps<TMeta extends Object = Object> = {
  /**
   * Metadata attached to the App context.
   *
   * Use this to pass custom data to child components via useApp.
   */
  meta?: TMeta
  /**
   * Child components.
   */
  children?: FabricNode
}

/**
 * Container component providing App context with metadata and lifecycle.
 *
 * Use this component to wrap your application and provide shared metadata
 * that can be accessed by child components using the useApp composable.
 *
 * @example
 * ```tsx
 * <Fabric meta={{ version: '1.0.0', author: 'John Doe' }}>
 *   <File baseName="user.ts" path="./user.ts">
 *     <File.Source>export type User = {}</File.Source>
 *   </File>
 * </Fabric>
 * ```
 */
export const Fabric = createComponent('Fabric', ({ children, ...props }: FabricProps) => {
  const { meta = {} } = props

  const { exit } = useContext(RootContext)

  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'Fabric', props })

    provide(NodeTreeContext, childTree)
  }

  provide(FabricContext, { exit, meta })

  return children
})

Fabric.displayName = 'Fabric'
