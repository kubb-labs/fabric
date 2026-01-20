import { provide, RootContext } from '@kubb/fabric-core'
import { Component } from 'react'

import type { ComponentNode, KubbElement, KubbNode } from '../types.ts'

type ErrorBoundaryProps = {
  onError: (error: Error) => void
  children?: KubbNode
}

class ErrorBoundary extends Component<{
  onError: ErrorBoundaryProps['onError']
  children?: KubbNode
}> {
  state = { hasError: false }

  static displayName = 'KubbErrorBoundary'
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

type RootProps = {
  /**
   * Exit (unmount) hook
   */
  readonly onExit: (error?: Error) => void
  /**
   * Error hook
   */
  readonly onError: (error: Error) => void
  readonly children?: KubbNode
}

/**
 * Provides the root context (exit hook) and wraps children into an
 * ErrorBoundary so errors can be forwarded to the `onError` handler.
 *
 * This component provides the root behaviour for the React Fabric runtime.
 *
 * Returns a React node tree representing the root of the Fabric app.
 */
export function Root({ onError, onExit, treeNode, fileManager, children }: RootProps): KubbElement {
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

Root.displayName = 'KubbRoot'
