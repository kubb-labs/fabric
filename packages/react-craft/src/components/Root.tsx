import { Component, createContext } from 'react'

import type { KubbNode } from '../types.ts'

type ErrorBoundaryProps<Meta extends Record<string, unknown> = Record<string, unknown>> = {
  onError: (error: Error) => void
  meta: Meta
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

export type RootContextProps<Meta extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * Exit (unmount) the whole Ink app.
   */
  readonly exit: (error?: Error) => void
  readonly meta: Meta
}

export const RootContext = createContext<RootContextProps>({
  exit: () => {},
  meta: {},
})

type RootProps<Meta extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * Exit (unmount) hook
   */
  readonly onExit: (error?: Error) => void
  /**
   * Error hook
   */
  readonly onError: (error: Error) => void
  readonly meta: Meta
  readonly children?: KubbNode
}

export function Root<Meta extends Record<string, unknown> = Record<string, unknown>>({ onError, onExit, meta, children }: RootProps<Meta>) {
  try {
    return (
      <ErrorBoundary
        onError={(error) => {
          onError(error)
        }}
      >
        <RootContext.Provider value={{ meta, exit: onExit }}>{children}</RootContext.Provider>
      </ErrorBoundary>
    )
  } catch (_e) {
    return null
  }
}

Root.Context = RootContext
Root.displayName = 'KubbRoot'
