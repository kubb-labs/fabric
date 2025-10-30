import { describe, expect, it } from 'vitest'

import { Cache } from './Cache.ts'

describe('Cache', () => {
  it('returns null for missing keys', () => {
    const cache = new Cache<string>()
    expect(cache.get('missing')).toBeNull()
  })

  it('sets and gets values', () => {
    const cache = new Cache<number>()
    cache.set('a', 1)
    cache.set('b', 2)

    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
  })

  it('delete removes the key', () => {
    const cache = new Cache<string>()
    cache.set('x', 'hello')
    expect(cache.get('x')).toBe('hello')

    cache.delete('x')
    expect(cache.get('x')).toBeNull()
  })

  it('clear removes all keys', () => {
    const cache = new Cache<string>()
    cache.set('a', '1')
    cache.set('b', '2')

    expect(cache.keys()).toEqual(['a', 'b'])
    expect(cache.values()).toEqual(['1', '2'])

    cache.clear()
    expect(cache.keys()).toEqual([])
    expect(cache.values()).toEqual([])
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBeNull()
  })

  it('keys returns insertion order and overwrite does not change order', () => {
    const cache = new Cache<number>()
    cache.set('k1', 10)
    cache.set('k2', 20)
    cache.set('k3', 30)

    expect(cache.keys()).toEqual(['k1', 'k2', 'k3'])

    // Overwrite k2; Map preserves original insertion order
    cache.set('k2', 200)

    expect(cache.get('k2')).toBe(200)
    expect(cache.keys()).toEqual(['k1', 'k2', 'k3'])
  })

  it('values returns insertion order', () => {
    const cache = new Cache<string>()
    cache.set('first', 'A')
    cache.set('second', 'B')
    cache.set('third', 'C')

    expect(cache.values()).toEqual(['A', 'B', 'C'])
  })
})
