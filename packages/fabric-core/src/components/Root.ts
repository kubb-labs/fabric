import { provide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'

type RootProps = {
  /**
   * Exit (unmount) hook
   */
  readonly onExit: (error?: Error) => void
  /**
   * Error hook
   */
  readonly onError: (error: Error) => void
  readonly children?: string
}

/**
 * Top-level root for fsx renderers. Returns children content and ensures
 * `onError` is called for runtime exceptions. Provides a RootContext with
 * an `exit` hook for downstream consumers.
 */
export function Root({ onError, children }: Omit<RootProps, 'onExit'>): string {
  provide(RootContext, { exit: () => {} })

  try {
    // In fsx, we don't have component trees like React
    // We just return the children and let context handle the rest
    return children || ''
  } catch (e) {
    if (e instanceof Error) {
      onError(e)
    }
    return ''
  }
}

Root.displayName = 'KubbRoot'
