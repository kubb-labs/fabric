import { describe, expect, it, beforeEach } from 'vitest'
import type * as KubbFile from '../KubbFile.ts'
import { createRefKey } from './refkey.ts'
import { RefKeyRegistry, extractRefKeysFromValue, resolveImportsFromRefKeys } from './importResolver.ts'

describe('RefKeyRegistry', () => {
  let registry: RefKeyRegistry

  beforeEach(() => {
    registry = new RefKeyRegistry()
  })

  it('should register a refkey from a source', () => {
    const refkey = createRefKey()
    const source: KubbFile.Source = {
      name: 'foo',
      value: 'const foo = "bar"',
      refkey: { id: refkey.id },
    }

    registry.registerFromSource(source, './file1.ts')

    const definition = registry.getDefinition(refkey.id)
    expect(definition).toEqual({
      name: 'foo',
      path: './file1.ts',
      isTypeOnly: undefined,
    })
  })

  it('should register a type-only refkey', () => {
    const refkey = createRefKey()
    const source: KubbFile.Source = {
      name: 'MyType',
      value: 'type MyType = string',
      isTypeOnly: true,
      refkey: { id: refkey.id },
    }

    registry.registerFromSource(source, './types.ts')

    const definition = registry.getDefinition(refkey.id)
    expect(definition).toEqual({
      name: 'MyType',
      path: './types.ts',
      isTypeOnly: true,
    })
  })

  it('should not register a source without a name', () => {
    const refkey = createRefKey()
    const source: KubbFile.Source = {
      value: 'const x = 1',
      refkey: { id: refkey.id },
    }

    registry.registerFromSource(source, './file1.ts')

    const definition = registry.getDefinition(refkey.id)
    expect(definition).toBeUndefined()
  })

  it('should clear all definitions', () => {
    const refkey = createRefKey()
    const source: KubbFile.Source = {
      name: 'foo',
      value: 'const foo = "bar"',
      refkey: { id: refkey.id },
    }

    registry.registerFromSource(source, './file1.ts')
    expect(registry.getDefinition(refkey.id)).toBeDefined()

    registry.clear()
    expect(registry.getDefinition(refkey.id)).toBeUndefined()
  })
})

describe('extractRefKeysFromValue', () => {
  it('should extract a refkey from a direct value', () => {
    const refkey = createRefKey()
    const refkeys = extractRefKeysFromValue(refkey)

    expect(refkeys).toHaveLength(1)
    expect(refkeys[0]).toBe(refkey)
  })

  it('should extract refkeys from an array', () => {
    const refkey1 = createRefKey()
    const refkey2 = createRefKey()
    const refkeys = extractRefKeysFromValue([refkey1, 'string', refkey2])

    expect(refkeys).toHaveLength(2)
    expect(refkeys).toContain(refkey1)
    expect(refkeys).toContain(refkey2)
  })

  it('should extract refkeys from nested objects', () => {
    const refkey1 = createRefKey()
    const refkey2 = createRefKey()
    const obj = {
      a: refkey1,
      b: {
        c: refkey2,
      },
    }

    const refkeys = extractRefKeysFromValue(obj)

    expect(refkeys).toHaveLength(2)
    expect(refkeys).toContain(refkey1)
    expect(refkeys).toContain(refkey2)
  })

  it('should handle null and undefined values', () => {
    expect(extractRefKeysFromValue(null)).toHaveLength(0)
    expect(extractRefKeysFromValue(undefined)).toHaveLength(0)
  })

  it('should handle primitive values', () => {
    expect(extractRefKeysFromValue('string')).toHaveLength(0)
    expect(extractRefKeysFromValue(123)).toHaveLength(0)
    expect(extractRefKeysFromValue(true)).toHaveLength(0)
  })

  it('should handle circular references', () => {
    const refkey = createRefKey()
    const obj: any = { refkey }
    obj.self = obj

    const refkeys = extractRefKeysFromValue(obj)

    expect(refkeys).toHaveLength(1)
    expect(refkeys[0]).toBe(refkey)
  })
})

describe('resolveImportsFromRefKeys', () => {
  let registry: RefKeyRegistry

  beforeEach(() => {
    registry = new RefKeyRegistry()
  })

  it('should resolve imports for refkeys used in sources', () => {
    const refkey = createRefKey()
    refkey.resolve('foo', './file1.ts')

    // Register the refkey definition
    registry.registerFromSource(
      {
        name: 'foo',
        value: 'const foo = "bar"',
        refkey: { id: refkey.id },
      },
      './file1.ts',
    )

    // Use the refkey in another file
    const file: KubbFile.File = {
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    }

    const imports = resolveImportsFromRefKeys(file, registry, './file2.ts')

    expect(imports).toHaveLength(1)
    expect(imports[0]).toEqual({
      path: './file1.ts',
      name: ['foo'],
      isTypeOnly: false,
    })
  })

  it('should resolve type-only imports', () => {
    const refkey = createRefKey()
    refkey.resolve('MyType', './types.ts', { isTypeOnly: true })

    registry.registerFromSource(
      {
        name: 'MyType',
        value: 'type MyType = string',
        isTypeOnly: true,
        refkey: { id: refkey.id },
      },
      './types.ts',
    )

    const file: KubbFile.File = {
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    }

    const imports = resolveImportsFromRefKeys(file, registry, './file2.ts')

    expect(imports).toHaveLength(1)
    expect(imports[0]).toEqual({
      path: './types.ts',
      name: ['MyType'],
      isTypeOnly: true,
    })
  })

  it('should not import from the same file', () => {
    const refkey = createRefKey()
    refkey.resolve('foo', './file1.ts')

    registry.registerFromSource(
      {
        name: 'foo',
        value: 'const foo = "bar"',
        refkey: { id: refkey.id },
      },
      './file1.ts',
    )

    const file: KubbFile.File = {
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    }

    const imports = resolveImportsFromRefKeys(file, registry, './file1.ts')

    expect(imports).toHaveLength(0)
  })

  it('should group multiple symbols from the same file', () => {
    const refkey1 = createRefKey()
    const refkey2 = createRefKey()
    refkey1.resolve('foo', './file1.ts')
    refkey2.resolve('bar', './file1.ts')

    registry.registerFromSource(
      {
        name: 'foo',
        value: 'const foo = 1',
        refkey: { id: refkey1.id },
      },
      './file1.ts',
    )
    registry.registerFromSource(
      {
        name: 'bar',
        value: 'const bar = 2',
        refkey: { id: refkey2.id },
      },
      './file1.ts',
    )

    const file: KubbFile.File = {
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: [refkey1, refkey2],
        },
      ],
    }

    const imports = resolveImportsFromRefKeys(file, registry, './file2.ts')

    expect(imports).toHaveLength(1)
    expect(imports[0].path).toBe('./file1.ts')
    expect(imports[0].name).toHaveLength(2)
    expect(imports[0].name).toContain('foo')
    expect(imports[0].name).toContain('bar')
  })

  it('should return empty array when no refkeys are found', () => {
    const file: KubbFile.File = {
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          value: 'const x = 1',
        },
      ],
    }

    const imports = resolveImportsFromRefKeys(file, registry, './file1.ts')

    expect(imports).toHaveLength(0)
  })
})
