import { createContext } from '../context.ts'

export type RootContextProps = {
  /**
   * Exit (unmount) the whole app.
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
  readonly children?: string
}

export function Root({ onError, children }: Omit<RootProps, 'onExit'>): string {
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

Root.Context = RootContext
Root.displayName = 'KubbRoot'
