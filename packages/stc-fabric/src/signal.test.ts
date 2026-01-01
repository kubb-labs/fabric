import { describe, expect, it } from 'vitest'
import { createSignal, ref } from './signal.ts'

describe('ref (Vue-style)', () => {
  it('should create a ref with initial value', () => {
    const count = ref(0)

    expect(count.value).toBe(0)
  })

  it('should allow reading the value', () => {
    const message = ref('Hello')

    expect(message.value).toBe('Hello')
  })

  it('should allow writing the value', () => {
    const count = ref(0)

    count.value = 5

    expect(count.value).toBe(5)
  })

  it('should handle object values', () => {
    const user = ref({ name: 'John', age: 30 })

    expect(user.value).toEqual({ name: 'John', age: 30 })

    user.value = { name: 'Jane', age: 25 }

    expect(user.value).toEqual({ name: 'Jane', age: 25 })
  })

  it('should handle array values', () => {
    const items = ref<number[]>([1, 2, 3])

    expect(items.value).toEqual([1, 2, 3])

    items.value = [4, 5, 6]

    expect(items.value).toEqual([4, 5, 6])
  })

  it('should support multiple refs independently', () => {
    const ref1 = ref(10)
    const ref2 = ref(20)

    expect(ref1.value).toBe(10)
    expect(ref2.value).toBe(20)

    ref1.value = 15
    ref2.value = 25

    expect(ref1.value).toBe(15)
    expect(ref2.value).toBe(25)
  })
})

describe('createSignal (legacy)', () => {
  it('should work as alias for ref', () => {
    const count = createSignal(0)

    expect(count.value).toBe(0)

    count.value = 5

    expect(count.value).toBe(5)
  })
})
