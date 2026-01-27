import { type FileManager, NodeTreeContext, provide, RootContext, type TreeNode } from '@kubb/fabric-core'
import { Component } from 'react'

import type { ComponentNode, FabricReactElement, FabricReactNode } from '../types.ts'

type ErrorBoundaryProps = {
  onError: (error: Error) => void
  children?: FabricReactNode
}

class ErrorBoundary extends Component<{
  onError: ErrorBoundaryProps['onError']
  children?: FabricReactNode
}> {
  state = { hasError: false }

  static displayName = 'ErrorBoundary'
  static getDerivedStateFromError(_error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (error) {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

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
  children?: FabricReactNode
}

/**
 * This component provides the root behavior for the Fabric runtime.
 */
export function Root({ onError, onExit, treeNode, fileManager, children }: RootProps): FabricReactElement {
  provide(RootContext, { exit: onExit, treeNode, fileManager })
  provide(NodeTreeContext, treeNode)

  return (
    <ErrorBoundary
      onError={(error) => {
        onError(error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

Root.displayName = 'Root'
