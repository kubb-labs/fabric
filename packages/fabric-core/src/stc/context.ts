import type { StcContext } from './types.ts'

/**
 * Context stack for tracking the current context values
 */
const contextStack = new Map<StcContext<any>, any[]>()

/**
 * Creates a new context for dependency injection
 * 
 * @example
 * ```ts
 * const ThemeContext = createContext({ color: 'blue' })
 * ```
 */
export function createContext<T>(defaultValue: T): StcContext<T> {
  const context: StcContext<T> = {
    defaultValue,
    Provider: ({ value, children = '' }) => {
      // Push value to context stack
      if (!contextStack.has(context)) {
        contextStack.set(context, [])
      }
      contextStack.get(context)!.push(value)

      // Render children
      const result = children

      // Pop value from context stack
      contextStack.get(context)!.pop()

      return result
    },
  }

  return context
}

/**
 * Retrieves the current value from a context
 * 
 * @example
 * ```ts
 * const theme = useContext(ThemeContext)
 * ```
 */
export function useContext<T>(context: StcContext<T>): T {
  const stack = contextStack.get(context)
  if (!stack || stack.length === 0) {
    return context.defaultValue
  }
  return stack[stack.length - 1]
}
