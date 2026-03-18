import path from 'node:path'
import { FileContext, FileManager, RootContext, TreeNode, unprovide } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import type { ComponentNode } from '@kubb/fabric-core/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { File, type FileExportProps, type FileImportProps } from './File.tsx'
import { Root } from './Root.tsx'

function getRootProps() {
  return {
    onError: vi.fn(),
    onExit: vi.fn(),
    treeNode: new TreeNode<ComponentNode>({ type: 'Root', props: {} }),
    fileManager: new FileManager(),
  }
}

describe('<File/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should add files with the FileManager', async () => {
    const rootProps = getRootProps()

    const fabric = createReactFabric()

    await fabric.render(
      <Root {...rootProps}>
        <File baseName="test.ts" path="./test.ts" />
      </Root>,
    )

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files[0]).toMatchObject({
      baseName: 'test.ts',
      path: './test.ts',
    })
  })

  it('should add a file with a banner', async () => {
    const rootProps = getRootProps()

    const fabric = createReactFabric()

    await fabric.render(
      <Root {...rootProps}>
        <File baseName="test.ts" path="./test.ts" banner={'/* eslint-disable */'} />
      </Root>,
    )

    expect(fabric.files[0]?.banner).toBe('/* eslint-disable */')
  })

  it('should add a file with a footer', async () => {
    const rootProps = getRootProps()

    const fabric = createReactFabric()

    await fabric.render(
      <Root {...rootProps}>
        <File baseName="test.ts" path="./test.ts" footer={'/* eslint-disable */'} />
      </Root>,
    )

    expect(fabric.files[0]?.footer).toBe('/* eslint-disable */')
  })

  it('render File with meta', async () => {
    const fabric = createReactFabric()

    await fabric.render(
      <File baseName="user.ts" path="./models/user.ts" meta={{ model: 'User' }}>
        <File.Source>type User = {'{}'}</File.Source>
      </File>,
    )
    const files = fabric.files

    expect(files[0]?.meta).toEqual({ model: 'User' })
  })

  it('should register multiple files', async () => {
    const rootProps = getRootProps()

    const fabric = createReactFabric()

    await fabric.render(
      <Root {...rootProps}>
        <File baseName="file1.ts" path="./file1.ts">
          <File.Source>const test = 1;</File.Source>
        </File>
        <File baseName="file2.ts" path="./file2.ts">
          <File.Source>const test = 2;</File.Source>
        </File>
        <File baseName="file3.ts" path="./file3.ts">
          <File.Source>const test = 3;</File.Source>
        </File>
      </Root>,
    )

    expect(fabric.files).toHaveLength(3)
    expect(fabric.files.map((f) => f?.baseName)).toMatchInlineSnapshot(`
      [
        "file1.ts",
        "file2.ts",
        "file3.ts",
      ]
    `)

    const [file1, file2, file3] = fabric.files

    expect(file1!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 1;"`)
    expect(file2!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 2;"`)
    expect(file3!.sources.map(({ value }) => value).join('\n')).toMatchInlineSnapshot(`"const test = 3;"`)
  })

  it('should throw error when using components outside of File', async () => {
    const fabric = createReactFabric()

    // The error should be thrown because 'banner' is not inside <File.Source>
    await expect(
      fabric.renderToString(
        <>
          ignore
          <File baseName="test.ts" path="path">
            banner
            <File.Source>
              test
              <div>sdfs</div>
            </File.Source>
          </File>
        </>,
      ),
    ).rejects.toThrow("'banner' should be part of <File.Source> component when using the <File/> component")
  })
})

describe('<File.Source/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should ignore components outside of File.Source', async () => {
    const fabric = createReactFabric()

    await fabric.render(
      <>
        ignore
        <File baseName="test.ts" path="path">
          <File.Source>test</File.Source>
        </File>
      </>,
    )
    const files = fabric.files

    const output = await fabric.renderToString(
      <>
        ignore
        <File baseName="test.ts" path="path">
          <File.Source>test</File.Source>
        </File>
      </>,
    )
    expect(output).toMatchInlineSnapshot(`"ignoretest"`)

    expect(files).toHaveLength(1)
    expect(files?.[0]?.sources?.[0]?.value).toMatchInlineSnapshot(`"test"`)
  })

  it('should set source with React component when JSX syntax is being used', async () => {
    const Component = (
      <File baseName="test.ts" path="path">
        <File.Source>
          <button className="className" type={'button'} aria-disabled={false} onClick={(e) => console.log(e)}>
            sdfs
          </button>
        </File.Source>
      </File>
    )

    const fabric = createReactFabric()

    await fabric.render(Component)
    const files = fabric.files

    expect(files?.[0]?.sources?.[0]?.value).toMatchInlineSnapshot(
      `"<button className="className" type="button" aria-disabled={false} onClick={(e) => console.log(e)}>sdfs</button>"`,
    )

    const output = await fabric.renderToString(Component)
    expect(output).toMatchInlineSnapshot(`"<button className="className" type="button" aria-disabled={false} onClick={(e) => console.log(e)}>sdfs</button>"`)
  })

  it('should set multiple sources when using File.Source multiple times', async () => {
    const Component = (
      <File baseName="test.ts" path="path">
        <File.Source>{'const file = 2;'}</File.Source>
        <File.Source isTypeOnly name={'test'} isExportable>
          {'export const test = 2;'}
        </File.Source>
      </File>
    )

    const fabric = createReactFabric()

    await fabric.render(Component)

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files?.[0]?.sources.map(({ value }) => value).join('/n')).toMatchInlineSnapshot(`"const file = 2;/nexport const test = 2;"`)
  })
})

describe('<File.Import/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should set the import when using File and File.Import', async () => {
    const rootProps = getRootProps()
    const Component = (
      <Root {...rootProps}>
        <File baseName="file1.ts" path="./file1.ts">
          <File.Source>
            <File.Import name={'test'} path={'./test.ts'} />
          </File.Source>
        </File>
      </Root>
    )

    const fabric = createReactFabric()

    await fabric.render(Component)

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files[0]?.imports).toHaveLength(1)
    expect(fabric.files[0]?.imports?.[0]).toMatchObject({
      name: 'test',
      path: './test.ts',
    })
  })

  const scenarios: Array<{ name: string; props: FileImportProps }> = [
    {
      name: 'basic import',
      props: { name: 'fabric', path: '@kubb/react-fabric' },
    },
    {
      name: 'typed import',
      props: { name: 'fabric', isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: '* as import',
      props: { name: 'fabric', isNameSpace: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'matches with root import',
      props: { name: 'fabric', root: '../', path: '@kubb/react-fabric' },
    },
    {
      name: 'named import',
      props: { name: ['createFabric'], isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named typed import',
      props: { name: ['Fabric'], isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named import (object)',
      props: { name: [{ propertyName: 'createFabric', name: 'create' }], path: '@kubb/react-fabric' },
    },
    {
      name: 'named import (object advanced)',
      props: { name: ['Fabric', { propertyName: 'createFabric', name: 'create' }], path: '@kubb/react-fabric' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const Component = <File.Import {...props} />

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should ignore that File.Import is a child of File.Source', async () => {
    const Component = (
      <File baseName="test.ts" path="path">
        <File.Source>
          <File.Import name="React" path="react" />
        </File.Source>
      </File>
    )

    const fabric = createReactFabric()

    await fabric.render(Component)

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files?.[0]?.sources?.[0]?.value).toMatchInlineSnapshot(`"import React from "react";"`)
    expect(fabric.files?.[0]?.imports?.[0]).toMatchObject({
      name: 'React',
      path: 'react',
    })

    const output = await fabric.renderToString(Component)
    expect(output).toMatchInlineSnapshot(`
      "import React from "react";
      "
    `)
  })

  it('render Import with File.Import inside of File with render', async () => {
    const Component = (
      <File baseName="test.ts" path="path.ts">
        <File.Import name="React" path="react" />
        <File.Source>test</File.Source>
      </File>
    )

    const fabric = createReactFabric()
    fabric.use(typescriptParser)

    await fabric.render(Component)

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files?.[0]?.sources?.[0]?.value).toMatchInlineSnapshot(`"test"`)
    expect(fabric.files?.[0]?.imports?.[0]).toMatchObject({
      name: 'React',
      path: 'react',
    })

    const output = await fabric.renderToString(Component)
    expect(output).toMatchInlineSnapshot(`
      "import React from "react";
      test"
    `)
  })
})

describe('<File.Export/>', () => {
  afterEach(() => {
    unprovide(RootContext)
    unprovide(FileContext)
  })

  it('should set the export when using File and File.Export', async () => {
    const rootProps = getRootProps()
    const Component = (
      <Root {...rootProps}>
        <File baseName="file1.ts" path="./file1.ts">
          <File.Export name={'test'} path={'./test.ts'} />
        </File>
      </Root>
    )

    const fabric = createReactFabric()

    await fabric.render(Component)

    expect(fabric.files).toHaveLength(1)
    expect(fabric.files[0]?.exports).toHaveLength(1)
    expect(fabric.files[0]?.exports?.[0]).toMatchObject({
      name: 'test',
      path: './test.ts',
    })
  })

  it('should print the export syntax', async () => {
    const Component = <File.Export path="kubb" />

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export * from "kubb";
      "
    `)
  })

  const scenarios: Array<{ name: string; props: FileExportProps }> = [
    {
      name: 'basic export',
      props: { name: 'fabric', path: '@kubb/react-fabric' },
    },
    {
      name: 'typed export',
      props: { name: 'fabric', isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: '* as export',
      props: { name: 'fabric', asAlias: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named export',
      props: { name: ['createFabric'], isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named typed export',
      props: { name: ['Fabric'], isTypeOnly: true, path: '@kubb/react-fabric' },
    },
    {
      name: 'named export (object advanced)',
      props: { name: ['Fabric', 'createFrabric'], path: '@kubb/react-fabric' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const Component = <File.Export {...props} />

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })
})
