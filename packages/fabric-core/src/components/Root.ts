import type { ComponentNode } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import type { FileManager } from '../FileManager.ts'
import type { TreeNode } from '../utils/TreeNode.ts'
import { Text } from './Text.ts'

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
  children?: string | (() => string | Array<string> | undefined)
}

/**
 * This component provides the root behavior for the Fabric runtime.
 */
export function Root({ onError, onExit, treeNode, fileManager, children }: RootProps): string {
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
}

Root.displayName = 'KubbRoot'
