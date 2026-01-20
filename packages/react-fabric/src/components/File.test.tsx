import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { File } from './File.tsx'

describe('<File/>', () => {
  it('render text', async () => {
    const Component = () => {
      return 'test'
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"test"`)
  })

  it('should add files with the FileManager', async () => {
    const rootProps = getRootProps()

    const fabric = createReactFabric()

    await fabric.render(
      <Root {...rootProps}>
        <File baseName="test.ts" path="./test.ts" />
      </Root>,
    )

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [
            {
              "asAlias": true,
              "isTypeOnly": false,
              "name": undefined,
              "path": "./index.ts",
            },
          ],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [],
        },
      ]
    `)
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
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [
            {
              "asAlias": false,
              "isTypeOnly": false,
              "name": "test",
              "path": "./test.ts",
            },
          ],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "export * from "./test.ts";",
            },
          ],
        },
      ]
    `)
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
    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "test",
            },
          ],
        },
      ]
    `)
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

    expect(output).toMatchInlineSnapshot(
      `"ignore<button className="className" type="button" aria-disabled={false} onClick={(e) => console.log(e)}>sdfs</button>"`,
    )
    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "<button className="className" type="button" aria-disabled={false} onClick={(e) => console.log(e)}>sdfs</button>",
            },
          ],
        },
      ]
    `)
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
    const files = fabric.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "const file = 2;",
            },
            {
              "isExportable": true,
              "isIndexable": false,
              "isTypeOnly": true,
              "name": "test",
              "value": "export const test = 2;",
            },
          ],
        },
      ]
    `)
  })

  it('render multiple Files', async () => {
    const Component = () => {
      return (
        <>
          <File baseName="test.ts" path="./">
            <File.Source>
              {`
            const test = 1;
            `}
              <File.Import name="node" path="node" />
            </File.Source>
          </File>
          <File baseName="test2.ts" path="./">
            <File.Source>
              {`
            const test2 = 2;
            `}
            </File.Source>
          </File>
        </>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "
                  const test = 1;
                  import node from "node";

                  const test2 = 2;
                  "
    `)

    await fabric.render(Component)
    const files = fabric.files

    expect(files.length).toBe(1)

    expect(files[0]?.sources).toMatchInlineSnapshot(`
      [
        {
          "isExportable": false,
          "isIndexable": false,
          "isTypeOnly": false,
          "name": undefined,
          "value": "const test = 1;
                  import node from "node";",
        },
        {
          "isExportable": false,
          "isIndexable": false,
          "isTypeOnly": false,
          "name": undefined,
          "value": "const test2 = 2;",
        },
      ]
    `)

    expect(files[0]?.imports).toMatchInlineSnapshot(`
      [
        {
          "isNameSpace": false,
          "isTypeOnly": false,
          "name": "node",
          "path": "node",
          "root": undefined,
        },
      ]
    `)

    expect(files[1]?.sources).toMatchInlineSnapshot('undefined')
  })

  it('render File with meta', async () => {
    const Component = () => {
      return (
        <File baseName="user.ts" path="./models/user.ts" meta={{ model: 'User' }}>
          <File.Source>type User = {'{}'}</File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)
    const files = fabric.files

    expect(files[0]?.meta).toEqual({ model: 'User' })
  })

  it('render File with banner', async () => {
    const Component = () => {
      return (
        <File baseName="api.ts" path="./api.ts" banner="/* eslint-disable */">
          <File.Source>const api = {'{}'}</File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)
    const files = fabric.files

    expect(files[0]?.banner).toBe('/* eslint-disable */')
  })

  it('render File with footer', async () => {
    const Component = () => {
      return (
        <File baseName="export.ts" path="./export.ts" footer="export default API;">
          <File.Source>const API = {'{}'}</File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)
    const files = fabric.files

    expect(files[0]?.footer).toBe('export default API;')
  })
})

describe('<File.Export/>', () => {
  it('render Export with print', async () => {
    const Component = () => {
      return <File.Export path="kubb" />
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export * from "kubb";
      "
    `)
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
      props: { name: ['App', { propertyName: 'createFabric', name: 'create' }], path: '@kubb/react-fabric' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const Component = <File.Import {...props} />

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "import React from "react";
      "
    `)
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
    const files = fabric.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "a0af9f865bf637e6736817f4ce552e4cdf7b8c36ea75bc254c1d1f0af744b5bf",
          "imports": [
            {
              "isNameSpace": false,
              "isTypeOnly": false,
              "name": "React",
              "path": "react",
              "root": undefined,
            },
          ],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "import React from "react";",
            },
          ],
        },
      ]
    `)
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
    const files = fabric.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "846c73bf0bf8108842e558e5cb3030529a5c7dc3f8c495d10f49b685ecbe96c3",
          "imports": [
            {
              "isNameSpace": false,
              "isTypeOnly": false,
              "name": "React",
              "path": "react",
              "root": undefined,
            },
          ],
          "meta": {},
          "name": "test",
          "path": "path.ts",
          "sources": [
            {
              "isExportable": false,
              "isIndexable": false,
              "isTypeOnly": false,
              "name": undefined,
              "value": "test",
            },
          ],
        },
      ]
    `)
  })

  it('render Import with File.Import inside of File with renderToString', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path.ts">
          <File.Import name="React" path="react" />
          <File.Source>test</File.Source>
        </File>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    fabric.use(typescriptParser)

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
      props: { name: ['App', 'createFrabric'], path: '@kubb/react-fabric' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const Component = <File.Export {...props} />

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })
})
