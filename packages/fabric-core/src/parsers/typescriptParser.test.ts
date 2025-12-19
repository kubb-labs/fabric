import type ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { createExport, createImport, print, typescriptParser } from './typescriptParser.ts'

const formatTS = (elements: ts.Node | (ts.Node | undefined)[]) => {
  const nodes: Array<ts.Node> = []
  const elementsArray = Array.isArray(elements) ? elements : [elements]
  for (const element of elementsArray) {
    if (element) {
      nodes.push(element)
    }
  }
  return print(...nodes)
}

describe('TypeScript parser', () => {
  it('should create various import statement types correctly', async () => {
    expect(
      formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "import hello from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
          isTypeOnly: true,
        }),
      ),
    ).toMatchInlineSnapshot(`
      "import type hello from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createImport({
          name: ['hello'],
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "import { hello } from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
          isNameSpace: true,
        }),
      ),
    ).toMatchInlineSnapshot(`
      "import * as hello from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createImport({
          name: [{ propertyName: 'hello', name: 'helloWorld' }],
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "import { hello as helloWorld } from "./hello.ts";
      "
    `)
  })

  it('should create various export statement types correctly', async () => {
    expect(
      formatTS(
        createExport({
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export * from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createExport({
          name: ['hello', 'world'],
          asAlias: true,
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export { hello, world } from "./hello.ts";
      "
    `)

    expect(
      formatTS(
        createExport({
          name: 'hello',
          asAlias: true,
          path: './hello.ts',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export * as hello from "./hello.ts";
      "
    `)

    try {
      formatTS(
        createExport({
          name: 'hello',
          path: './hello.ts',
        }),
      )
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('should combine banner, imports, exports, sources, and footer with proper extension handling', async () => {
    const file = {
      path: '/project/src/index.ts',
      extname: '.ts',
      banner: '// banner',
      footer: '// footer',
      sources: [{ value: 'export const x = 1' }, { value: 'export const y = 2' }],
      imports: [
        { name: 'foo', path: './utils.ts' },
        { name: ['bar'], path: '/project/src/bar.js', root: '/project/src' },
      ],
      exports: [{ path: './hello.js' }, { name: ['alpha', 'beta'], path: './names.ts', asAlias: true }],
      meta: {},
    } as any

    const output = await typescriptParser.parse(file, { extname: '.ts' as any })
    expect(output).toMatchInlineSnapshot(`
      "// banner
      import foo from "./utils.ts";
      import { bar } from "./bar.ts";
      export * from "./hello.ts";
      export { alpha, beta } from "./names.ts";

      export const x = 1

      export const y = 2
      // footer"
    `)
  })
})
