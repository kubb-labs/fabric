import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import type { TreeNode } from '../utils/TreeNode.ts'
import { useContext } from './useContext.ts'

export type ComponentNode = {
  type: string
  props: Record<string, unknown>
}

/**
 * Accesses the current node tree for tracking component hierarchy.
 *
 * Use this composable to inspect or manipulate the component tree structure.
 * Returns null if not within a component that provides NodeTreeContext.
 *
 * @returns The current TreeNode or null
 *
 * @example
 * ```ts
 * const nodeTree = useNodeTree()
 * if (nodeTree) {
 *   const childTree = nodeTree.addChild({ type: 'MyComponent', props: {} })
 * }
 * ```
 */
export function useNodeTree(): TreeNode<ComponentNode> | null {
  return useContext(NodeTreeContext)
}
