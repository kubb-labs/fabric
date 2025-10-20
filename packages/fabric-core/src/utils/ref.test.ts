import { describe, it, expect, vi } from 'vitest'
import { ref, type Ref } from './ref'

describe('ref', () => {
  it('should create a ref with initial value and expose value getter', () => {
    const count = ref(1)
    expect(count.value).toBe(1)
  })

  it('should update value and notify watchers on change', () => {
    const r = ref(0)
    const fn = vi.fn()

    const stop = r.watch!(fn)

    // initial call on subscribe
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(0)

    r.value = 1
    expect(r.value).toBe(1)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(1)

    stop()
  })

  it('should not notify watchers when setting the same value', () => {
    const r = ref('a')
    const fn = vi.fn()

    const stop = r.watch!(fn)

    // initial call
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('a')

    // set same value -> no additional call
    r.value = 'a'
    expect(fn).toHaveBeenCalledTimes(1)

    stop()
  })

  it('should support multiple watchers and allow unsubscribe', () => {
    const r = ref({ n: 0 }) as Ref<{ n: number }>
    const a = vi.fn()
    const b = vi.fn()

    const stopA = r.watch!(a)
    const stopB = r.watch!(b)

    // both called initially
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)

    r.value = { n: 1 }
    expect(a).toHaveBeenCalledTimes(2)
    expect(b).toHaveBeenCalledTimes(2)

    // unsubscribe A
    stopA()

    r.value = { n: 2 }
    expect(a).toHaveBeenCalledTimes(2) // unchanged
    expect(b).toHaveBeenCalledTimes(3)

    // unsubscribe B
    stopB()

    r.value = { n: 3 }
    expect(a).toHaveBeenCalledTimes(2)
    expect(b).toHaveBeenCalledTimes(3)
  })

  it('should allow creating a ref without initial value (defaults to null)', () => {
    const r = ref<string | null>()
    expect(r.value).toBeNull()

    const fn = vi.fn()
    const stop = r.watch!(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(null)

    r.value = 'x'
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('x')

    stop()
  })
})
