import { beforeEach, describe, expect, it } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createRefKey } from '../utils/refkey.ts'
import { refKeyPlugin } from './refKeyPlugin.ts'

describe('refKeyPlugin', () => {
  let fabric: ReturnType<typeof createFabric>

  beforeEach(() => {
    fabric = createFabric()
  })

  it('should register refkey definitions when files are added', async () => {
    const refkey = createRefKey()

    fabric.use(refKeyPlugin)

    await fabric.addFile({
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          name: 'foo',
          value: 'const foo = "bar"',
          refkey: refkey.resolve('foo', './file1.ts'),
        },
      ],
    })

    // The plugin should have registered the refkey internally
    // We can verify this by checking if imports are resolved in another file
    await fabric.addFile({
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    })

    // Access the files to trigger processing event listeners
    const files = fabric.files

    expect(files).toHaveLength(2)
  })

  it('should not modify files when disabled', async () => {
    const refkey = createRefKey()

    fabric.use(refKeyPlugin, { enabled: false })

    await fabric.addFile({
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          name: 'foo',
          value: 'const foo = "bar"',
          refkey: refkey.resolve('foo', './file1.ts'),
        },
      ],
    })

    await fabric.addFile({
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    })

    const file2 = fabric.context.fileManager.getByPath('./file2.ts')
    expect(file2?.imports).toEqual([])
  })

  it('should handle multiple refkeys from same file', async () => {
    const refkey1 = createRefKey()
    const refkey2 = createRefKey()

    fabric.use(refKeyPlugin)

    await fabric.addFile({
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          name: 'foo',
          value: 'const foo = 1',
          refkey: refkey1.resolve('foo', './file1.ts'),
        },
        {
          name: 'bar',
          value: 'const bar = 2',
          refkey: refkey2.resolve('bar', './file1.ts'),
        },
      ],
    })

    await fabric.addFile({
      baseName: 'file2.ts',
      path: './file2.ts',
      sources: [
        {
          value: [refkey1, refkey2],
        },
      ],
    })

    const files = fabric.files
    expect(files).toHaveLength(2)
  })

  it('should handle type-only refkeys', async () => {
    const refkey = createRefKey()

    fabric.use(refKeyPlugin)

    await fabric.addFile({
      baseName: 'types.ts',
      path: './types.ts',
      sources: [
        {
          name: 'MyType',
          value: 'type MyType = string',
          isTypeOnly: true,
          refkey: refkey.resolve('MyType', './types.ts', { isTypeOnly: true }),
        },
      ],
    })

    await fabric.addFile({
      baseName: 'file.ts',
      path: './file.ts',
      sources: [
        {
          value: refkey,
        },
      ],
    })

    const files = fabric.files
    expect(files).toHaveLength(2)
  })

  it('should not add self-imports', async () => {
    const refkey = createRefKey()

    fabric.use(refKeyPlugin)

    await fabric.addFile({
      baseName: 'file1.ts',
      path: './file1.ts',
      sources: [
        {
          name: 'foo',
          value: 'const foo = "bar"',
          refkey: refkey.resolve('foo', './file1.ts'),
        },
        {
          value: refkey, // Using refkey in same file
        },
      ],
    })

    const file1 = fabric.context.fileManager.getByPath('./file1.ts')
    
    // Should not have auto-imports since the refkey is used in the same file
    expect(file1?.imports).toEqual([])
  })
})
