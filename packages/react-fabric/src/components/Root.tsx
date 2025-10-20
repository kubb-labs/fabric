import { Component, createContext } from 'react'

import type { KubbNode } from '../types.ts'

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

export type RootContextProps = {
  /**
   * Exit (unmount) the whole Ink app.
   */
  readonly exit: (error?: Error) => void
}

export const RootContext = createContext<RootContextProps>({
  exit: () => {},
})

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

export function Root({ onError, onExit, children }: RootProps) {
  try {
    return (
      <ErrorBoundary
        onError={(error) => {
          onError(error)
        }}
      >
        <RootContext.Provider value={{ exit: onExit }}>{children}</RootContext.Provider>
      </ErrorBoundary>
    )
  } catch (_e) {
    return null
  }
}

Root.Context = RootContext
Root.displayName = 'KubbRoot'
