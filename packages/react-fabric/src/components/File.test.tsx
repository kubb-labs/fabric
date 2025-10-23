import { expect } from 'vitest'
import { File } from './File.tsx'
import { createApp } from '@kubb/fabric-core'
import { reactPlugin } from '../plugins/reactPlugin.ts'

describe('<File/>', () => {
  test('render text', async () => {
    const Component = () => {
      return 'test'
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"test"`)
  })

  test('render File', async () => {
    const Component = () => {
      return <File baseName="test.ts" path="path" />
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`""`)
  })

  test('render File with Import and Export', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path">
          <File.Import name={'React'} path="react" />
          <File.Export asAlias path="./index.ts" />
        </File>
      )
    }
    const app = createApp()
    app.use(reactPlugin)

    await app.render(Component)
    const files = app.files

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
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [],
        },
      ]
    `)
  })

  test('do not render File', async () => {
    const enable = false
    const Component = () => {
      return (
        <>
          {enable && (
            <File baseName="test.ts" path="path">
              <File.Import name={'React'} path="react" />
              <File.Export asAlias path="./index.ts" />
            </File>
          )}
        </>
      )
    }
    const app = createApp()
    app.use(reactPlugin)

    app.render(Component)
    const files = app.files

    expect(files).toMatchInlineSnapshot('[]')
  })

  test('render File with Export inside Source', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path">
          <File.Source>
            <File.Export path={''} name={'test'} />
          </File.Source>
        </File>
      )
    }
    const app = createApp()
    app.use(reactPlugin)

    await app.render(Component)
    const files = app.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [
            {
              "asAlias": undefined,
              "isTypeOnly": false,
              "name": "test",
              "path": "",
            },
          ],
          "extname": ".ts",
          "footer": undefined,
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
              "name": undefined,
              "value": "",
            },
          ],
        },
      ]
    `)
  })

  test('render File with source', async () => {
    const Component = () => {
      return (
        <>
          ignore
          <File baseName="test.ts" path="path">
            banner
            <File.Source>
              test
              <div>sdfs</div>
            </File.Source>
          </File>
        </>
      )
    }
    const app = createApp()
    app.use(reactPlugin)

    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`""`)
  })

  test('render File with source', async () => {
    const Component = () => {
      return (
        <>
          ignore
          <File baseName="test.ts" path="path">
            <File.Source>test</File.Source>
          </File>
        </>
      )
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    await app.render(Component)
    const files = app.files

    expect(output).toMatchInlineSnapshot(`"ignoretest"`)
    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
              "name": undefined,
              "value": "test",
            },
          ],
        },
      ]
    `)
  })

  test('render File with source and React element', async () => {
    const Component = () => {
      return (
        <>
          ignore
          <File baseName="test.ts" path="path">
            <File.Source>
              <button className="className" type={'button'} aria-disabled={false} onClick={(e) => console.log(e)}>
                sdfs
              </button>
            </File.Source>
          </File>
        </>
      )
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    await app.render(Component)
    const files = app.files

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
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
              "name": undefined,
              "value": "<button className="className" type="button" aria-disabled={false} onClick={(e) => console.log(e)}>sdfs</button>",
            },
          ],
        },
      ]
    `)
  })

  test('render File with multiple sources', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path">
          <File.Source>{'const file = 2;'}</File.Source>
          <File.Source isTypeOnly name={'test'} isExportable>
            {`
            export const test = 2;
            `}
          </File.Source>
        </File>
      )
    }
    const app = createApp()

    app.use(reactPlugin)

    await app.render(Component)
    const files = app.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [],
          "meta": {},
          "name": "test",
          "path": "path",
          "sources": [
            {
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
              "name": undefined,
              "value": "const file = 2;",
            },
            {
              "isExportable": true,
              "isIndexable": undefined,
              "isTypeOnly": true,
              "name": "test",
              "value": "export const test = 2;",
            },
          ],
        },
      ]
    `)
  })

  test('render multiple Files', async () => {
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
    const app = createApp()
    app.use(reactPlugin)

    await app.render(Component)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()

    await app.render(Component)
    const files = app.files

    expect(files.length).toBe(1)

    expect(files[0]?.sources).toMatchSnapshot()

    expect(files[0]?.imports).toMatchInlineSnapshot(`
      [
        {
          "isNameSpace": undefined,
          "isTypeOnly": false,
          "name": "node",
          "path": "node",
          "root": undefined,
        },
      ]
    `)

    expect(files[1]?.sources).toMatchSnapshot()
  })
})

describe('<File.Export/>', () => {
  test('render Export with print', async () => {
    const Component = () => {
      return <File.Export path="kubb" />
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "export * from "kubb";
      "
    `)
  })
})

describe('<File.Import/>', () => {
  test('render Import', async () => {
    const Component = () => {
      return <File.Import name="React" path="react" />
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "import React from "react";
      "
    `)
  })

  test('render Import with type', async () => {
    const Component = () => {
      return <File.Import name="React" path="react" isTypeOnly />
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "import type React from "react";
      "
    `)
  })

  test('render Import with app', async () => {
    const Component = () => {
      return <File.Import name="React" root="types" path="types/test" />
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "import React from "./test";
      "
    `)
  })

  test('render Import with File.Import inside of File.Source', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path">
          <File.Source>
            <File.Import name="React" path="react" />
          </File.Source>
        </File>
      )
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    await app.render(Component)
    const files = app.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "e97f857b92d108e8de1788ef76cd7ff642b0f0ea7e196ba089a852b24b570f30",
          "imports": [
            {
              "isNameSpace": undefined,
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
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
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

  test('render Import with File.Import inside of File', async () => {
    const Component = () => {
      return (
        <File baseName="test.ts" path="path.ts">
          <File.Import name="React" path="react" />
          <File.Source>test</File.Source>
        </File>
      )
    }
    const app = createApp()
    app.use(reactPlugin)

    const output = await app.renderToString(Component)

    await app.render(Component)
    const files = app.files

    expect(files).toMatchInlineSnapshot(`
      [
        {
          "banner": undefined,
          "baseName": "test.ts",
          "exports": [],
          "extname": ".ts",
          "footer": undefined,
          "id": "97e35e44c38e860fc3736792ed817c2b81b7ffd0bd9442bf973c116414ae8e37",
          "imports": [
            {
              "isNameSpace": undefined,
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
              "isExportable": undefined,
              "isIndexable": undefined,
              "isTypeOnly": undefined,
              "name": undefined,
              "value": "test",
            },
          ],
        },
      ]
    `)
    expect(output).toMatchInlineSnapshot(`
      "import React from "react";
      test"
    `)
  })
})
