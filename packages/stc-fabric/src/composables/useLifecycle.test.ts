import { describe, expect, it, vi } from 'vitest'
import { RootContext } from '../components/Root.ts'
import { provide } from '../context.ts'
import { useLifecycle } from './useLifecycle.ts'

describe('useLifecycle', () => {
  it('should return exit function from root context', () => {
    const exitMock = vi.fn()

    provide(RootContext, { exit: exitMock })

    const { exit } = useLifecycle()

    exit()

    expect(exitMock).toHaveBeenCalledOnce()
  })

  it('should use default no-op exit when context not provided', () => {
    const { exit } = useLifecycle()

    // Should not throw
    expect(() => exit()).not.toThrow()
  })
})
