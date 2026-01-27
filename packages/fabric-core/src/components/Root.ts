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
   * Callback to exit the Fabric application.
   *
   * Call this to stop rendering and clean up resources.
   */
  onExit: (error?: Error) => void
  /**
   * Error handler for runtime exceptions.
   *
   * Receives errors thrown during component rendering.
   */
  onError: (error: Error) => void
  /**
   * Tree structure representing the component hierarchy.
   *
   * Used internally for tracking component relationships.
   */
  treeNode: TreeNode<ComponentNode>
  /**
   * FileManager instance for file operations.
   *
   * Manages all files created during rendering.
   */
  fileManager: FileManager
  /**
   * Child components.
   */
  children?: FabricNode
}

/**
 * Root component providing core Fabric runtime context.
 *
 * This component is typically used internally by the Fabric renderer.
 * It provides the root context including FileManager, error handling,
 * and lifecycle management.
 *
 * @example
 * ```tsx
 * <Root
 *   onExit={(error) => process.exit(error ? 1 : 0)}
 *   onError={(error) => console.error(error)}
 *   treeNode={treeNode}
 *   fileManager={fileManager}
 * >
 *   <App>
 *     Your components here
 *   </App>
 * </Root>
 * ```
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

Root.displayName = 'Root'
