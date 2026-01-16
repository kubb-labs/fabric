import type { ComponentNode } from '../composables/useNodeTree.ts'
import { createContext } from '../context.ts'
import type { TreeNode } from '../utils/TreeNode.ts'

/**
 * Context for having the current NodeTree
 */
export const NodeTreeContext = createContext<TreeNode<ComponentNode> | null>(null)
