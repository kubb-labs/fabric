import { describe, expect, it } from 'vitest'
import { createRefKey, isRefKey, refKeyToString } from './refkey.ts'

describe('createRefKey', () => {
  it('should create a refkey with a unique id', () => {
    const ref1 = createRefKey()
    const ref2 = createRefKey()

    expect(ref1.id).toBeDefined()
    expect(ref2.id).toBeDefined()
    expect(ref1.id).not.toBe(ref2.id)
  })

  it('should create a refkey with an optional name', () => {
    const ref = createRefKey('mySymbol')

    expect(ref.name).toBe('mySymbol')
  })

  it('should allow resolving a refkey with a symbol name and path', () => {
    const ref = createRefKey()
    const resolved = ref.resolve('foo', './file1.ts')

    expect(resolved.name).toBe('foo')
    expect(resolved.path).toBe('./file1.ts')
    expect(resolved.isTypeOnly).toBeUndefined()
  })

  it('should allow resolving a refkey with type-only option', () => {
    const ref = createRefKey()
    const resolved = ref.resolve('MyType', './types.ts', { isTypeOnly: true })

    expect(resolved.name).toBe('MyType')
    expect(resolved.path).toBe('./types.ts')
    expect(resolved.isTypeOnly).toBe(true)
  })

  it('should return the same refkey instance after resolving', () => {
    const ref = createRefKey()
    const resolved = ref.resolve('foo', './file1.ts')

    expect(resolved).toBe(ref)
  })

  it('should update refkey properties when resolved multiple times', () => {
    const ref = createRefKey('initial')
    
    ref.resolve('first', './file1.ts')
    expect(ref.name).toBe('first')
    expect(ref.path).toBe('./file1.ts')
    
    ref.resolve('second', './file2.ts', { isTypeOnly: true })
    expect(ref.name).toBe('second')
    expect(ref.path).toBe('./file2.ts')
    expect(ref.isTypeOnly).toBe(true)
  })
})

describe('isRefKey', () => {
  it('should return true for valid refkeys', () => {
    const ref = createRefKey()
    expect(isRefKey(ref)).toBe(true)
  })

  it('should return false for non-refkey values', () => {
    expect(isRefKey(null)).toBe(false)
    expect(isRefKey(undefined)).toBe(false)
    expect(isRefKey({})).toBe(false)
    expect(isRefKey({ id: 'test' })).toBe(false)
    expect(isRefKey({ resolve: () => {} })).toBe(false)
    expect(isRefKey('string')).toBe(false)
    expect(isRefKey(123)).toBe(false)
  })
})

describe('refKeyToString', () => {
  it('should return the symbol name if available', () => {
    const ref = createRefKey()
    ref.resolve('mySymbol', './file.ts')

    expect(refKeyToString(ref)).toBe('mySymbol')
  })

  it('should return the id if no name is set', () => {
    const ref = createRefKey()

    expect(refKeyToString(ref)).toBe(ref.id)
  })
})
