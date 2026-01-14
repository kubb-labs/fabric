import { afterEach, describe, expect, it } from 'vitest'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { inject, provide, unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { FileContext } from '../contexts/FileContext.ts'
import { FileCollector } from '../utils/FileCollector.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Const } from './Const.ts'
import { File } from './File.ts'

describe('File', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
    unprovide(FileContext)
  })

  it('should return empty string', () => {
    const result = File({ baseName: 'test.ts', path: './test.ts' })
    expect(result).toBe('')
  })

  it('should register file with collector when context is provided', () => {
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

  it('should register file with meta', () => {
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

  it('should register file with banner', () => {
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

  it('should register file with footer', () => {
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

  it('should handle no collector in context gracefully', () => {
    // Should not throw even when no collector is provided
    expect(() => {
      File({ baseName: 'test.ts', path: './test.ts' })
    }).not.toThrow()
  })

  it('should register multiple files', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    File({ baseName: 'file1.ts', path: './file1.ts' })
    File({ baseName: 'file2.ts', path: './file2.ts' })
    File({ baseName: 'file3.ts', path: './file3.ts' })

    const files = collector.files
    expect(files).toHaveLength(3)
    expect(files.map((f) => f?.baseName)).toEqual(['file1.ts', 'file2.ts', 'file3.ts'])
  })

  it('should add a node to the NodeTreeContext when provided', () => {
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

  it('should add multiple nodes to the NodeTreeContext when rendering a File and a Const', () => {
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

  it.todo('should save the file in the FileContext for child components to use')
  it.todo('should save the file in the FileCollectorContext for child components to use')
  it('should set multiple files in the FileCollectorContext', () => {
    const fileCollector = new FileCollector()

    const result = App({
      fileCollector,
      children() {
        return [
          File({
            baseName: 'file.ts',
            path: './file.ts',
            children: () => File.Source({ children: () => "const test = 'hello';" }),
          }),
          File({
            baseName: 'file2.ts',
            path: './file2.ts',
            children: () => File.Source({ children: () => "const test2 = 'hello';" }),
          }),
        ]
      },
    })

    expect(fileCollector.files).toHaveLength(2)

    expect(result).toMatchInlineSnapshot(`
      "const test = 'hello';
      const test2 = 'hello';"
    `)
  })
  it('should set the source when using File and File.Source', () => {
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
            children: () => File.Source({ children: () => "const test = 'hello';" }),
          }),
        ]
      },
    })

    expect(tree.children).toHaveLength(1)

    const fileNode = tree.children[0]!
    expect(fileNode.data).toMatchObject({
      props: {
        baseName: 'file.ts',
        path: './file.ts',
      },
      type: 'File',
    })
    expect(fileNode.children).toHaveLength(1)

    const fileSourceNode = fileNode.children[0]!

    expect(fileSourceNode.data).toMatchObject({
      props: {},
      type: 'FileSource',
    })

    expect(result).toMatchInlineSnapshot(`"const test = 'hello';"`)
  })
  it.todo('should set the import when using File and File.Import')
  it.todo('should set the export when using File and File.Export')

  it('should save the file in the FileContext for child components to use', () => {
    const fileCollector = new FileCollector()
    provide(FileCollectorContext, fileCollector)

    // Create a custom component that reads from FileContext
    const ChildComponent = (): string => {
      const currentFile = inject(FileContext)
      return currentFile ? `File: ${currentFile.baseName}` : 'No file'
    }

    const result = File({
      baseName: 'test.ts',
      path: './test.ts',
      children: () => ChildComponent(),
    })

    expect(result).toBe('File: test.ts')
  })

  it('should save the file in the FileCollectorContext for child components to use', () => {
    const fileCollector = new FileCollector()
    provide(FileCollectorContext, fileCollector)

    File({
      baseName: 'parent.ts',
      path: './parent.ts',
    })

    // Verify file was added to collector
    const files = fileCollector.files
    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      baseName: 'parent.ts',
      path: './parent.ts',
    })
  })

  it('should call File.Import without throwing', () => {
    // File.Import is a no-op that just adds to the node tree
    expect(() => {
      File.Import({ name: 'React', path: 'react' })
    }).not.toThrow()
  })

  it('should call File.Export without throwing', () => {
    // File.Export is a no-op that just adds to the node tree
    expect(() => {
      File.Export({ path: './index.ts', asAlias: true })
    }).not.toThrow()
  })
})
