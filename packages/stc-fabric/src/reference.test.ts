import { afterEach, describe, expect, it } from 'vitest'
import { clearReferences, createReference, getReference } from './reference.ts'

describe('createReference', () => {
  afterEach(() => {
    clearReferences()
  })

  it('should create a reference with name and value', () => {
    const ref = createReference('myVar', 'const myVar = 42')

    expect(ref.name).toBe('myVar')
    expect(ref.value).toBe('const myVar = 42')
  })

  it('should store reference for later retrieval', () => {
    createReference('myVar', 'const myVar = 42')

    const ref = getReference('myVar')

    expect(ref).toBeDefined()
    expect(ref?.name).toBe('myVar')
    expect(ref?.value).toBe('const myVar = 42')
  })

  it('should handle different value types', () => {
    const stringRef = createReference('str', 'string value')
    const numberRef = createReference('num', 123)
    const objectRef = createReference('obj', { key: 'value' })

    expect(stringRef.value).toBe('string value')
    expect(numberRef.value).toBe(123)
    expect(objectRef.value).toEqual({ key: 'value' })
  })
})

describe('getReference', () => {
  afterEach(() => {
    clearReferences()
  })

  it('should return undefined for non-existent reference', () => {
    const ref = getReference('nonexistent')

    expect(ref).toBeUndefined()
  })

  it('should return the correct reference', () => {
    createReference('ref1', 'value1')
    createReference('ref2', 'value2')

    const ref1 = getReference('ref1')
    const ref2 = getReference('ref2')

    expect(ref1?.value).toBe('value1')
    expect(ref2?.value).toBe('value2')
  })
})

describe('clearReferences', () => {
  it('should clear all references', () => {
    createReference('ref1', 'value1')
    createReference('ref2', 'value2')

    expect(getReference('ref1')).toBeDefined()
    expect(getReference('ref2')).toBeDefined()

    clearReferences()

    expect(getReference('ref1')).toBeUndefined()
    expect(getReference('ref2')).toBeUndefined()
  })

  it('should allow creating new references after clearing', () => {
    createReference('ref1', 'value1')
    clearReferences()

    createReference('ref2', 'value2')

    expect(getReference('ref1')).toBeUndefined()
    expect(getReference('ref2')).toBeDefined()
  })
})
