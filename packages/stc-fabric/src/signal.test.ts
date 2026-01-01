import { describe, expect, it } from 'vitest'
import { createSignal } from './signal.ts'

describe('createSignal', () => {
  it('should create a signal with initial value', () => {
    const count = createSignal(0)

    expect(count.value).toBe(0)
  })

  it('should allow reading the value', () => {
    const message = createSignal('Hello')

    expect(message.value).toBe('Hello')
  })

  it('should allow writing the value', () => {
    const count = createSignal(0)

    count.value = 5

    expect(count.value).toBe(5)
  })

  it('should handle object values', () => {
    const user = createSignal({ name: 'John', age: 30 })

    expect(user.value).toEqual({ name: 'John', age: 30 })

    user.value = { name: 'Jane', age: 25 }

    expect(user.value).toEqual({ name: 'Jane', age: 25 })
  })

  it('should handle array values', () => {
    const items = createSignal<number[]>([1, 2, 3])

    expect(items.value).toEqual([1, 2, 3])

    items.value = [4, 5, 6]

    expect(items.value).toEqual([4, 5, 6])
  })

  it('should support multiple signals independently', () => {
    const signal1 = createSignal(10)
    const signal2 = createSignal(20)

    expect(signal1.value).toBe(10)
    expect(signal2.value).toBe(20)

    signal1.value = 15
    signal2.value = 25

    expect(signal1.value).toBe(15)
    expect(signal2.value).toBe(25)
  })
})
