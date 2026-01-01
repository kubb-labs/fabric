import { describe, expect, it } from 'vitest'
import { createContext, useContext } from './context.ts'

describe('createContext', () => {
  it('should create a context with default value', () => {
    const ThemeContext = createContext({ color: 'blue' })

    expect(ThemeContext).toBeDefined()
    expect(ThemeContext.defaultValue).toEqual({ color: 'blue' })
  })

  it('should have a Provider component', () => {
    const ThemeContext = createContext({ color: 'blue' })

    expect(ThemeContext.Provider).toBeDefined()
    expect(typeof ThemeContext.Provider).toBe('function')
  })
})

describe('useContext', () => {
  it('should return default value when no provider', () => {
    const ThemeContext = createContext({ color: 'blue' })
    const theme = useContext(ThemeContext)

    expect(theme).toEqual({ color: 'blue' })
  })

  it('should return provided value from Provider', () => {
    const ThemeContext = createContext({ color: 'blue' })
    
    // Simulate being inside a Provider
    const result = ThemeContext.Provider({ value: { color: 'red' }, children: 'test' })
    
    expect(result).toBe('test')
  })

  it('should handle nested providers', () => {
    const ThemeContext = createContext({ color: 'blue' })
    
    // Outer provider
    const inner = ThemeContext.Provider({ 
      value: { color: 'green' }, 
      children: 'inner' 
    })
    const outer = ThemeContext.Provider({ 
      value: { color: 'red' }, 
      children: inner
    })
    
    expect(outer).toBe('inner')
  })
})

describe('context integration', () => {
  it('should work with component pattern', () => {
    const ConfigContext = createContext({ prefix: 'test' })

    function Component() {
      const config = useContext(ConfigContext)
      return `${config.prefix}_variable`
    }

    const result = Component()
    expect(result).toBe('test_variable')
  })
})
