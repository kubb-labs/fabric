import type ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { createArrowFunction, createConst, createExport, createFunction, createImport, createTypeAlias, print, typescriptParser } from './typescriptParser.ts'

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
        { name: ['bar'], path: './project/src/bar.js', root: './project/src' },
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

describe('createFunction', () => {
  it('should create a simple function declaration', () => {
    expect(print(createFunction({ name: 'hello' }))).toMatchInlineSnapshot(`
      "function hello() {
      }
      "
    `)
  })

  it('should create a function with params and return type', () => {
    expect(
      print(
        createFunction({
          name: 'getUser',
          params: 'id: number',
          returnType: 'string',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "function getUser(id: number): string {
      }
      "
    `)
  })

  it('should create an exported async function with generics', () => {
    expect(
      print(
        createFunction({
          name: 'fetch',
          export: true,
          async: true,
          generics: ['T extends object'],
          params: 'url: string',
          returnType: 'T',
          body: 'return response.json() as T',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export async function fetch<T extends object>(url: string): Promise<T> {
          return response.json() as T;
      }
      "
    `)
  })

  it('should create an exported default function', () => {
    expect(
      print(
        createFunction({
          name: 'handler',
          export: true,
          default: true,
          params: 'req: Request',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export default function handler(req: Request) {
      }
      "
    `)
  })

  it('should attach a JSDoc comment', () => {
    expect(
      print(
        createFunction({
          name: 'add',
          params: 'a: number, b: number',
          returnType: 'number',
          body: 'return a + b',
          JSDoc: { comments: ['Adds two numbers.', '@param a - first operand', '@param b - second operand'] },
        }),
      ),
    ).toMatchInlineSnapshot(`
      "/**
       * Adds two numbers.
       * @param a - first operand
       * @param b - second operand
       */
      function add(a: number, b: number): number {
          return a + b;
      }
      "
    `)
  })
})

describe('createArrowFunction', () => {
  it('should create a simple arrow function', () => {
    expect(print(createArrowFunction({ name: 'greet' }))).toMatchInlineSnapshot(`
      "const greet = () => {
      };
      "
    `)
  })

  it('should create a single-line arrow function', () => {
    expect(
      print(
        createArrowFunction({
          name: 'double',
          params: 'n: number',
          returnType: 'number',
          singleLine: true,
          body: 'n * 2',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "const double = (n: number): number => n * 2;
      "
    `)
  })

  it('should create an exported async arrow function with body', () => {
    expect(
      print(
        createArrowFunction({
          name: 'loadData',
          export: true,
          async: true,
          params: 'id: string',
          returnType: 'Data',
          body: 'return fetch(id).then(r => r.json())',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export const loadData = async (id: string): Promise<Data> => {
          return fetch(id).then(r => r.json());
      };
      "
    `)
  })

  it('should create an arrow function with generics', () => {
    expect(
      print(
        createArrowFunction({
          name: 'identity',
          export: true,
          generics: 'T',
          params: 'value: T',
          returnType: 'T',
          singleLine: true,
          body: 'value',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export const identity = <T>(value: T): T => value;
      "
    `)
  })
})

describe('createTypeAlias', () => {
  it('should create a simple type alias', () => {
    expect(print(createTypeAlias({ name: 'UserId', type: 'string' }))).toMatchInlineSnapshot(`
      "type UserId = string;
      "
    `)
  })

  it('should create an exported type alias with a union', () => {
    expect(
      print(
        createTypeAlias({
          name: 'Status',
          export: true,
          type: '"active" | "inactive" | "pending"',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export type Status = "active" | "inactive" | "pending";
      "
    `)
  })

  it('should create a generic type alias', () => {
    expect(
      print(
        createTypeAlias({
          name: 'ApiResponse',
          export: true,
          generics: ['T'],
          type: '{ data: T; status: number }',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export type ApiResponse<T> = {
          data: T;
          status: number;
      };
      "
    `)
  })

  it('should attach a JSDoc comment', () => {
    expect(
      print(
        createTypeAlias({
          name: 'UserId',
          export: true,
          type: 'string | number',
          JSDoc: { comments: ['Unique identifier for a user.'] },
        }),
      ),
    ).toMatchInlineSnapshot(`
      "/**
       * Unique identifier for a user.
       */
      export type UserId = string | number;
      "
    `)
  })
})

describe('createConst', () => {
  it('should create a simple const', () => {
    expect(print(createConst({ name: 'greeting', value: '"hello"' }))).toMatchInlineSnapshot(`
      "const greeting = "hello";
      "
    `)
  })

  it('should create an exported const with a type annotation', () => {
    expect(
      print(
        createConst({
          name: 'BASE_URL',
          export: true,
          type: 'string',
          value: '"https://api.example.com"',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export const BASE_URL: string = "https://api.example.com";
      "
    `)
  })

  it('should create a const with as const assertion', () => {
    expect(
      print(
        createConst({
          name: 'ROLES',
          export: true,
          value: '["admin", "user", "guest"]',
          asConst: true,
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export const ROLES = (["admin", "user", "guest"]) as const;
      "
    `)
  })

  it('should create a const with object value', () => {
    expect(
      print(
        createConst({
          name: 'config',
          export: true,
          value: '{ host: "localhost", port: 3000 }',
        }),
      ),
    ).toMatchInlineSnapshot(`
      "export const config = { host: "localhost", port: 3000 };
      "
    `)
  })

  it('should attach a JSDoc comment', () => {
    expect(
      print(
        createConst({
          name: 'API_VERSION',
          export: true,
          value: '"v1"',
          JSDoc: { comments: ['Current API version.'] },
        }),
      ),
    ).toMatchInlineSnapshot(`
      "/**
       * Current API version.
       */
      export const API_VERSION = "v1";
      "
    `)
  })
})
