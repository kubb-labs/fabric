import { describe, expect, it } from 'vitest'
import { createContext, inject, provide, unprovide, useContext } from './context.ts'

describe('Vue 3 style provide/inject', () => {
  it('should provide and inject values', () => {
    const ThemeKey = Symbol('theme')

    provide(ThemeKey, { color: 'blue' })
    const theme = inject(ThemeKey)

    expect(theme).toEqual({ color: 'blue' })

    unprovide(ThemeKey)
  })

  it('should use default value when not provided', () => {
    const ConfigKey = Symbol('config')

    const config = inject(ConfigKey, { enabled: false })

    expect(config).toEqual({ enabled: false })
  })

  it('should handle nested provides', () => {
    const ThemeKey = Symbol('theme')

    provide(ThemeKey, { color: 'red' })
    expect(inject(ThemeKey)).toEqual({ color: 'red' })

    provide(ThemeKey, { color: 'green' })
    expect(inject(ThemeKey)).toEqual({ color: 'green' })

    unprovide(ThemeKey)
    expect(inject(ThemeKey)).toEqual({ color: 'red' })

    unprovide(ThemeKey)
  })
})

describe('createContext (React-style)', () => {
  it('should create a context with default value', () => {
    const ThemeContext = createContext({ color: 'blue' })

    expect(typeof ThemeContext).toBe('symbol')
  })

  it('should return default value when using inject', () => {
    const ThemeContext = createContext({ color: 'blue' })
    const theme = inject(ThemeContext)

    expect(theme).toEqual({ color: 'blue' })
  })

  it('should override default with provided value', () => {
    const ThemeContext = createContext({ color: 'blue' })

    provide(ThemeContext, { color: 'red' })
    const theme = inject(ThemeContext)

    expect(theme).toEqual({ color: 'red' })

    unprovide(ThemeContext)
  })
})

describe('useContext (React-style)', () => {
  it('should work as alias for inject', () => {
    const ConfigContext = createContext({ prefix: 'test' })

    provide(ConfigContext, { prefix: 'app' })
    const config = useContext(ConfigContext)

    expect(config).toEqual({ prefix: 'app' })

    unprovide(ConfigContext)
  })

  it('should return default value', () => {
    const ThemeContext = createContext({ color: 'blue' })
    const theme = useContext(ThemeContext)

    expect(theme).toEqual({ color: 'blue' })
  })
})

describe('context integration', () => {
  it('should work with component pattern', () => {
    const ConfigContext = createContext({ prefix: 'test' })

    function Component() {
      const config = useContext(ConfigContext) // type is inferred
      return `${config.prefix}_variable`
    }

    const result = Component()
    expect(result).toBe('test_variable')
  })

  it('should infer types from createContext', () => {
    const ThemeContext = createContext({ color: 'blue', size: 12 })

    // Type is inferred without explicit annotation
    const theme = useContext(ThemeContext)

    expect(theme.color).toBe('blue')
    expect(theme.size).toBe(12)
  })

  it('should maintain type safety with provide/inject', () => {
    const ConfigContext = createContext({ enabled: true, count: 0 })

    provide(ConfigContext, { enabled: false, count: 10 })

    // Type is inferred from context
    const config = useContext(ConfigContext)

    expect(config.enabled).toBe(false)
    expect(config.count).toBe(10)

    unprovide(ConfigContext)
  })
})
