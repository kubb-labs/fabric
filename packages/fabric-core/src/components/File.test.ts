import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { inject, unprovide } from '../context.ts'
import { FileContext } from '../contexts/FileContext.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins/fsxPlugin/fsxPlugin.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { File, type FileExportProps, type FileImportProps } from './File.ts'

describe('File', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should add files with the FileManager', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const output = await fabric.render(File({ baseName: 'test.ts', path: './test.ts' }))

    const files = fabric.files

    expect(files).toHaveLength(1)
    expect(files[0]).toMatchObject({
      baseName: 'test.ts',
      path: './test.ts',
    })

    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should not return files is disabled', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const enable = false

    const Component = createComponent('Component', () => {
      return enable ? File({ baseName: 'test.ts', path: './test.ts' }) : undefined
    })

    await fabric.render(Component())

    const files = fabric.files

    expect(files).toMatchInlineSnapshot('[]')
  })

  it('should add a file with a banner', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'api.ts',
        path: './api.ts',
        banner: '/* eslint-disable */',
      }),
    )

    const files = fabric.files

    expect(files[0]?.banner).toBe('/* eslint-disable */')
  })

  it('should register file with footer', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'export.ts',
        path: './export.ts',
        meta: { model: 'User' },
      }),
    )

    const files = fabric.files

    expect(files[0]?.meta).toEqual({ model: 'User' })
  })

  it('should register file with footer', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'export.ts',
        path: './export.ts',
        footer: 'export default API;',
      }),
    )

    const files = fabric.files

    expect(files[0]?.footer).toBe('export default API;')
  })

  it('should register multiple files', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Component = createComponent('Component', () => {
      return [
        File({
          baseName: 'file1.ts',
          path: './file1.ts',
          children: File.Source({ children: 'const test = 1;' }),
        }),
        File({
          baseName: 'file2.ts',
          path: './file2.ts',
          children: File.Source({ children: 'const test = 2;' }),
        }),
        File({
          baseName: 'file3.ts',
          path: './file3.ts',
          children: File.Source({ children: 'const test = 3;' }),
        }),
      ]
    })

    await fabric.render(Component())

    const files = fabric.files

    expect(files).toHaveLength(3)
    expect(files.map((f) => f?.baseName)).toMatchInlineSnapshot(`
      [
        "file1.ts",
        "file2.ts",
        "file3.ts",
      ]
    `)

    const [file1, file2, file3] = files

    expect(file1!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 1;"`)
    expect(file2!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 2;"`)
    expect(file3!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 3;"`)
  })

  it('should set the import when using File and File.Import', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: File.Source({
          children: File.Import({ name: 'test', path: './test.ts' }),
        }),
      }),
    )

    const files = fabric.files

    expect(files).toHaveLength(1)
    expect(files[0]?.imports).toHaveLength(1)
    expect(files[0]?.imports?.[0]).toMatchObject({
      name: 'test',
      path: './test.ts',
    })
  })

  it('should set the export when using File and File.Export', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: File.Export({ name: 'test', path: './test.ts' }),
      }),
    )

    const files = fabric.files

    expect(files).toHaveLength(1)
    expect(files[0]?.exports).toHaveLength(1)
    expect(files[0]?.exports?.[0]).toMatchObject({
      name: 'test',
      path: './test.ts',
    })
  })

  it('should set the source when using File and File.Source', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: File.Source({ children: "const test = 'hello';" }),
      }),
    )

    const files = fabric.files

    expect(files).toHaveLength(1)
    expect(files[0]?.sources).toHaveLength(1)
    expect(files[0]?.sources?.[0]).toMatchObject({
      value: "const test = 'hello';",
    })
  })

  it('should set the source when using File, File.Import and File.Source', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: [File.Import({ name: 'test', path: 'test.ts' }), File.Source({ children: "const test = 'hello';" })],
      }),
    )

    const files = fabric.files

    expect(files).toHaveLength(1)
    const file = files.at(0)!

    expect(file.sources).toHaveLength(1)
    expect(file.sources?.[0]).toMatchObject({
      value: "const test = 'hello';",
    })
    expect(file.imports).toHaveLength(1)
    expect(file.imports?.[0]).toMatchObject({
      name: 'test',
      path: 'test.ts',
    })
  })

  it('should save the file in the FileContext for child components to use', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const ChildComponent = createComponent('Child', () => {
      const currentFile = inject(FileContext)
      return currentFile ? `File: ${currentFile.baseName}` : 'No file'
    })

    const result = await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: ChildComponent({}),
      }),
    )

    expect(result).toBe('File: file1.ts')
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    await fabric.render(
      File({
        baseName: 'test.ts',
        path: './test.ts',
        children: File.Import({ name: 'MyClass', path: './MyClass.ts' }),
      }),
    )

    expect(treeNode.children).toHaveLength(1)
    const fileChild = treeNode.children[0]!
    expect(fileChild.data).toMatchObject({
      type: 'File',
      props: expect.objectContaining({ baseName: 'test.ts', path: './test.ts' }),
    })

    const importChild = fileChild.children[0]!
    expect(importChild.data).toMatchObject({
      type: 'FileImport',
      props: expect.objectContaining({ name: 'MyClass', path: './MyClass.ts' }),
    })
  })
})

describe('File.Source', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should set multiple sources when using File.Source multiple times', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    await fabric.render(
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
        children: [File.Source({ children: 'const file = 2;' }), File.Source({ name: 'test', isTypeOnly: true, children: ' export const test = 2;' })],
      }),
    )

    const files = fabric.files

    expect(files).toHaveLength(1)
    expect(files?.[0]?.sources.map(({ value }) => value).join('/n')).toMatchInlineSnapshot(`"const file = 2;/n export const test = 2;"`)
  })
})

describe('<File.Import/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  const scenarios: Array<{ name: string; props: FileImportProps }> = [
    {
      name: 'basic import',
      props: { name: 'fabric', path: '@kubb/fabric-core' },
    },
    {
      name: 'typed import',
      props: { name: 'fabric', isTypeOnly: true, path: '@kubb/fabric-core' },
    },
    {
      name: '* as import',
      props: { name: 'fabric', isNameSpace: true, path: '@kubb/fabric-core' },
    },
    {
      name: 'matches with root import',
      props: { name: 'fabric', root: '../', path: '@kubb/fabric-core' },
    },
    {
      name: 'named import',
      props: { name: ['createFabric'], isTypeOnly: true, path: '@kubb/fabric-core' },
    },
    {
      name: 'named typed import',
      props: { name: ['Fabric'], isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named import (object)',
      props: { name: [{ propertyName: 'createFabric', name: 'create' }], path: '@kubb/fabric-core' },
    },
    {
      name: 'named import (object advanced)',
      props: { name: ['Fabric', { propertyName: 'createFabric', name: 'create' }], path: '@kubb/fabric-core' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const fabric = createFabric()
    const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const output = await fabric.render(
      File({
        baseName: 'test.ts',
        path: './test.ts',
        children: File.Import(props),
      }),
    )

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })
})

describe('<File.Export/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  const scenarios: Array<{ name: string; props: FileExportProps }> = [
    {
      name: 'basic export',
      props: { name: 'fabric', path: '@kubb/fabric-core' },
    },
    {
      name: 'typed export',
      props: { name: 'fabric', isTypeOnly: true, path: '@kubb/fabric-core' },
    },
    {
      name: '* as export',
      props: { name: 'fabric', asAlias: true, path: '@kubb/fabric-core' },
    },
    {
      name: 'named export',
      props: { name: ['createFabric'], isTypeOnly: true, path: '@kubb/fabric-core' },
    },
    {
      name: 'named typed export',
      props: { name: ['Fabric'], isTypeOnly: true, path: '@kubb/fabric-core' },
    },
    {
      name: 'named export (object advanced)',
      props: { name: ['Fabric', 'createFabric'], path: '@kubb/fabric-core' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const fabric = createFabric()
    const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const output = await fabric.render(
      File({
        baseName: 'test.ts',
        path: './test.ts',
        children: File.Export(props),
      }),
    )

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })
})
