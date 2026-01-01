import { describe, expect, it } from 'vitest'
import { createSignal, ref, useState } from './signal.ts'

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

describe('useState (React-style)', () => {
  it('should create state with initial value', () => {
    const [count] = useState(0)

    expect(count()).toBe(0)
  })

  it('should allow setting the value', () => {
    const [count, setCount] = useState(0)

    setCount(5)

    expect(count()).toBe(5)
  })

  it('should support updater function', () => {
    const [count, setCount] = useState(0)

    setCount(prev => prev + 1)
    expect(count()).toBe(1)

    setCount(prev => prev + 10)
    expect(count()).toBe(11)
  })

  it('should handle object values', () => {
    const [user, setUser] = useState({ name: 'John', age: 30 })

    expect(user()).toEqual({ name: 'John', age: 30 })

    setUser({ name: 'Jane', age: 25 })

    expect(user()).toEqual({ name: 'Jane', age: 25 })
  })

  it('should handle array values', () => {
    const [items, setItems] = useState<number[]>([1, 2, 3])

    expect(items()).toEqual([1, 2, 3])

    setItems([4, 5, 6])

    expect(items()).toEqual([4, 5, 6])
  })

  it('should support multiple states independently', () => {
    const [count1, setCount1] = useState(10)
    const [count2, setCount2] = useState(20)

    expect(count1()).toBe(10)
    expect(count2()).toBe(20)

    setCount1(15)
    setCount2(25)

    expect(count1()).toBe(15)
    expect(count2()).toBe(25)
  })

  it('should work with updater function for complex state', () => {
    const [user, setUser] = useState({ name: 'John', age: 30 })

    setUser(prev => ({ ...prev, age: 31 }))

    expect(user()).toEqual({ name: 'John', age: 31 })
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
