import { createContext } from '../context.ts'
import type { TreeNode } from '../utils/TreeNode.ts'
import type { ComponentNode } from './AppContext.ts'

/**
 * Context for having the current NodeTree
 */
export const NodeTreeContext = createContext<TreeNode<ComponentNode> | null>(null)
