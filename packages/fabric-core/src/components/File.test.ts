import { afterEach, describe, expect, test } from 'vitest'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { provide, unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { FileCollector } from '../utils/FileCollector.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Const } from './Const.ts'
import { File } from './File.ts'

describe('File', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
  })

  test('should return empty string', () => {
    const result = File({ baseName: 'test.ts', path: './test.ts' })
    expect(result).toBe('')
  })

  test('should register file with collector when context is provided', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({ baseName: 'test.ts', path: './test.ts' })

    const files = collector.files
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      baseName: 'test.ts',
      path: './test.ts',
    })
  })

  test('should register file with meta', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({
      baseName: 'user.ts',
      path: './models/user.ts',
      meta: { model: 'User' },
    })

    const files = collector.files
    expect(files[0]?.meta).toEqual({ model: 'User' })
  })

  test('should register file with banner', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({
      baseName: 'api.ts',
      path: './api.ts',
      banner: '/* eslint-disable */',
    })

    const files = collector.files
    expect(files[0]?.banner).toBe('/* eslint-disable */')
  })

  test('should register file with footer', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({
      baseName: 'export.ts',
      path: './export.ts',
      footer: 'export default API;',
    })

    const files = collector.files
    expect(files[0]?.footer).toBe('export default API;')
  })

  test('should handle no collector in context gracefully', () => {
    // Should not throw even when no collector is provided
    expect(() => {
      File({ baseName: 'test.ts', path: './test.ts' })
    }).not.toThrow()
  })

  test('should register multiple files', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({ baseName: 'file1.ts', path: './file1.ts' })
    File({ baseName: 'file2.ts', path: './file2.ts' })
    File({ baseName: 'file3.ts', path: './file3.ts' })

    const files = collector.files
    expect(files).toHaveLength(3)
    expect(files.map((f) => f?.baseName)).toEqual(['file1.ts', 'file2.ts', 'file3.ts'])
  })

  test('should add a node to the ComponentTreeContext when provided', () => {
    const tree = new TreeNode({ type: 'root', props: {} })

    App({
      tree,
      children() {
        return [File({ baseName: 'test.ts', path: './test.ts' })]
      },
    })

    expect(tree.children).toHaveLength(1)
    const child = tree.children[0]!
    expect(child.data).toMatchObject({
      type: 'File',
      props: expect.objectContaining({ baseName: 'test.ts', path: './test.ts' }),
    })
  })

  test('should add multiple nodes to the ComponentTreeContext when rendering a File and a Const', () => {
    const tree = new TreeNode<ComponentNode>({ type: 'App', props: {} })

    const result = App({
      tree,
      meta: {
        name: 'TestApp',
      },
      children() {
        return [
          File({
            baseName: 'file.ts',
            path: './file.ts',
            children: () => [Const({ name: 'myConst', children: '"value"' })],
          }),
        ]
      },
    })

    expect(tree.children).toHaveLength(1)

    const fileNode = tree.children[0]!
    expect(fileNode.children).toHaveLength(1)
    expect(fileNode.children?.[0]?.data).toMatchObject({
      props: {
        name: 'myConst',
      },
      type: 'Const',
    })

    expect(result).toMatchInlineSnapshot(`"const myConst = "value""`)
  })
})
