import { afterEach, describe, expect, test } from 'vitest'
import { unprovide } from '../context.ts'
import { App, AppContext } from './App.ts'

describe('App', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(AppContext)
  })

  test('should return empty string when no children', () => {
    const result = App({ meta: {} })
    expect(result).toBe('')
  })

  test('should return children when provided', () => {
    const children = 'const x = 1;\nconst y = 2;'
    const result = App({ meta: {}, children })
    expect(result).toBe(children)
  })

  test('should have displayName', () => {
    expect(App.displayName).toBe('KubbApp')
  })

  test('should have Context property', () => {
    expect(App.Context).toBe(AppContext)
  })

  test('should work with typed meta', () => {
    type Meta = { version: string; author: string }
    const meta: Meta = { version: '1.0.0', author: 'test' }
    const result = App<Meta>({ meta, children: 'code here' })
    expect(result).toBe('code here')
  })

  test('should handle undefined children', () => {
    const result = App({ meta: { test: true } })
    expect(result).toBe('')
  })
})
