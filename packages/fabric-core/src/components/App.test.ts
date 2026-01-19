import { afterEach, describe, expect, it } from 'vitest'
import { inject, unprovide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { App } from './App.ts'

describe('App', () => {
  afterEach(() => {
    unprovide(AppContext)
  })

  it('should return children when provided', () => {
    const children = 'const x = 1'
    const output = App({ children })()

    expect(output).toBe(children)
  })

  it('should handle undefined children', () => {
    const output = App({ meta: { test: true } })()
    expect(output).toBe('')
  })

  it('should inject meta data', () => {
    const Text = () => {
      const ctx = inject(AppContext)

      return JSON.stringify(ctx?.meta)
    }

    const output = App({
      meta: { version: '1.0.0', author: 'test' },
      children() {
        return Text()
      },
    })()

    expect(output).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
