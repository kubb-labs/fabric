/**
 * Context stack for tracking the current context values
 * 
 * Note: This uses a global Map for simplicity in code generation scenarios.
 * For concurrent runtime execution, consider using AsyncLocalStorage or
 * instance-based context management.
 */
const contextStack = new Map<symbol, any[]>()
const contextDefaults = new Map<symbol, any>()

/**
 * Provides a value to descendant components (Vue 3 style)
 * 
 * @example
 * ```ts
 * const ThemeKey = Symbol('theme')
 * provide(ThemeKey, { color: 'blue' })
 * ```
 */
export function provide<T>(key: symbol, value: T): void {
  if (!contextStack.has(key)) {
    contextStack.set(key, [])
  }
  contextStack.get(key)!.push(value)
}

/**
 * Injects a value provided by an ancestor component (Vue 3 style)
 * 
 * @example
 * ```ts
 * const theme = inject(ThemeKey, { color: 'default' })
 * ```
 */
export function inject<T>(key: symbol, defaultValue?: T): T {
  const stack = contextStack.get(key)
  if (!stack || stack.length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    const storedDefault = contextDefaults.get(key)
    if (storedDefault !== undefined) {
      return storedDefault
    }
    throw new Error(`No value provided for key: ${key.toString()}`)
  }
  return stack[stack.length - 1]
}

/**
 * Unprovides a value (for cleanup)
 * @internal
 */
export function unprovide(key: symbol): void {
  const stack = contextStack.get(key)
  if (stack && stack.length > 0) {
    stack.pop()
  }
}

/**
 * Creates a context key with a default value (React-style compatibility)
 * 
 * @example
 * ```ts
 * const ThemeContext = createContext({ color: 'blue' })
 * ```
 */
export function createContext<T>(defaultValue: T): symbol {
  const key = Symbol('context')
  contextDefaults.set(key, defaultValue)
  return key
}

/**
 * React-style alias for inject
 * 
 * @example
 * ```ts
 * const theme = useContext(ThemeContext)
 * ```
 */
export function useContext<T>(key: symbol, defaultValue?: T): T {
  return inject(key, defaultValue)
}
