import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import type { TreeNode } from '../utils/TreeNode.ts'
import { useContext } from './useContext.ts'

export type ComponentNode = {
  type: string
  props: Record<string, unknown>
}

export function useNodeTree(): TreeNode<ComponentNode> | null {
  return useContext(NodeTreeContext)
}
