import type { ComponentNode } from '../composables/useNodeTree.ts'
import { createContext } from '../context.ts'
import { FileManager } from '../FileManager.ts'
import { TreeNode } from '../utils/TreeNode.ts'

export type RootContextProps = {
  /**
   * Exit (unmount) the whole app.
   */
  exit: (error?: Error) => void
  /**
   * TreeNode representing the tree structure of the app.
   */
  treeNode: TreeNode<ComponentNode>
  /**
   * FileManager instance for managing files within the app.
   */
  fileManager: FileManager
}

/**
 * Context providing root-level functionalities such as exit hook, tree node structure, and file management.
 * Define in the `render` helper of the runtime.
 */
export const RootContext = createContext<RootContextProps>({
  exit: () => {},
  treeNode: new TreeNode({ type: 'Root', props: {} }),
  fileManager: new FileManager(),
})
