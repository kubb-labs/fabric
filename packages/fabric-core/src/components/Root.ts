import type { ComponentNode } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import type { FileManager } from '../FileManager.ts'
import type { TreeNode } from '../utils/TreeNode.ts'

export type RootProps = {
  /**
   * Exit (unmount) the whole app.
   */
  onExit: (error?: Error) => void
  /**
   * Error hook receiving runtime exceptions.
   */
  onError: (error: Error) => void
  /**
   * TreeNode representing the tree structure of the app.
   */
  treeNode: TreeNode<ComponentNode>
  /**
   * FileManager instance for managing files within the app.
   */
  fileManager: FileManager
  /**
   * Children nodes.
   */
  children?: FabricNode
}

/**
 * This component provides the root behavior for the Fabric runtime.
 */
export const Root = createComponent('Root', ({ onError, onExit, treeNode, fileManager, children }: RootProps) => {
  provide(RootContext, { exit: onExit, treeNode, fileManager })
  provide(NodeTreeContext, treeNode)

  try {
    return children
  } catch (e) {
    if (e instanceof Error) {
      onError?.(e)
    }
    return ''
  }
})

Root.displayName = 'KubbRoot'
