import { afterEach, describe, expect, test, vi } from 'vitest'
import { unprovide } from '../context.ts'
import { Root, RootContext } from './Root.ts'

describe('Root', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(RootContext)
  })

  test('should return empty string when no children', () => {
    const onError = vi.fn()
    const result = Root({ onError })
    expect(result).toBe('')
  })

  test('should return children when provided', () => {
    const onError = vi.fn()
    const children = 'const x = 1;\nconst y = 2;'
    const result = Root({ onError, children })
    expect(result).toBe(children)
  })

  test('should not call onError when no error occurs', () => {
    const onError = vi.fn()
    Root({ onError, children: 'normal code' })
    expect(onError).not.toHaveBeenCalled()
  })

  test('should handle undefined children', () => {
    const onError = vi.fn()
    const result = Root({ onError })
    expect(result).toBe('')
  })

  test('should have RootContext exported', () => {
    expect(RootContext).toBeDefined()
  })

  test('should work with multiline children', () => {
    const onError = vi.fn()
    const children = `
      import { test } from 'test'
      
      export function main() {
        test()
      }
    `
    const result = Root({ onError, children })
    expect(result).toBe(children)
  })

  test('should preserve whitespace in children', () => {
    const onError = vi.fn()
    const children = '  indented\n    more indented'
    const result = Root({ onError, children })
    expect(result).toBe(children)
  })
})
