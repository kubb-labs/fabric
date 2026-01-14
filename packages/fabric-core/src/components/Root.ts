import { provide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { Text } from './Text.ts'

type Props = {
  /**
   * Exit (unmount) hook
   */
  readonly onExit: (error?: Error) => void
  /**
   * Error hook
   */
  readonly onError?: (error: Error) => void
  readonly children?: string | (() => string | Array<string>)
}

/**
 * Top-level root for fsx renderers. Returns children content and ensures
 * `onError` is called for runtime exceptions. Provides a RootContext with
 * an `exit` hook for downstream consumers.
 */
export function Root({ onError, onExit, children }: Props): string {
  provide(RootContext, { exit: onExit })

  try {
    return Text({ children })
  } catch (e) {
    if (e instanceof Error) {
      onError?.(e)
    }
    return ''
  }
}

Root.displayName = 'KubbRoot'
