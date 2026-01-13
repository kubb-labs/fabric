import { afterEach, describe, expect, it, vi } from 'vitest'

import { provide, unprovide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { useLifecycle } from './useLifecycle.ts'

describe('useLifecycle', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(RootContext)
  })

  it('should return exit function from root context', () => {
    vi.useFakeTimers()
    const exitMock = vi.fn()

    provide(RootContext, { exit: exitMock })

    const { exit } = useLifecycle()

    exit()
    vi.runAllTimers()

    expect(exitMock).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('should use default no-op exit when context not provided', () => {
    const { exit } = useLifecycle()

    // Should not throw
    expect(() => exit()).not.toThrow()
  })
})
