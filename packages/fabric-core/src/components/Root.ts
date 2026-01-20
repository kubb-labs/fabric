import { provide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import type { FabricNode } from '../Fabric.ts'
import type { FileManager } from '../FileManager.ts'
import type { TreeNode } from '../utils/TreeNode.ts'
import { Text } from './Text.ts'

type Props = {
  /**
   * Exit (unmount) hook
   */
  readonly onExit: (error?: Error) => void
  /**
   * Error hook
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
 * Top-level root for fsx renderers. Returns children content and ensures
 * `onError` is called for runtime exceptions. Provides a RootContext with
 * an `exit` hook for downstream consumers.
 */
export const Root = createComponent(({ onError, onExit, treeNode, fileManager, children }: RootProps) => {
  provide(RootContext, { exit: onExit, treeNode, fileManager })
  provide(NodeTreeContext, treeNode)

  try {
    return Text({ children })
  } catch (e) {
    if (e instanceof Error) {
      onError?.(e)
    }
    return ''
  }
})

Root.displayName = 'KubbRoot'
