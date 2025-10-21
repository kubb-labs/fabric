import { format } from '../mocks/format.ts'
import { combineImports, combineSources, createFile, combineExports } from './createFile.ts'

import type * as KubbFile from './KubbFile.ts'
import { parseFile } from './FileProcessor.ts'

describe('createFile', () => {
  test('if getFileSource is returning code with imports', async () => {
    const code = await parseFile(
      createFile({
        baseName: 'test.ts',
        path: 'models/ts/test.ts',
        imports: [
          {
            name: ['Pets'],
            path: './Pets.ts',
            isTypeOnly: true,
          },
        ],
        sources: [
          {
            value: 'export type Pet = Pets;',
          },
        ],
      }),
    )

    const codeWithDefaultImport = await parseFile(
      createFile({
        baseName: 'test.ts',
        path: 'models/ts/test.ts',
        imports: [
          {
            name: 'client',
            path: './Pets.ts',
          },
          {
            name: ['Pets', 'Cat'],
            path: './Pets.ts',
            isTypeOnly: true,
          },
          {
            name: 'React',
            path: './React.ts',
          },
        ],
        sources: [
          {
            value: 'export type Pet = Pets | Cat; const test = [client, React];',
          },
        ],
      }),
    )

    const codeWithDefaultImportOrder = await parseFile(
      createFile({
        baseName: 'test.ts',
        path: 'models/ts/test.ts',
        sources: [
          {
            value: 'export type Pet = Pets | Cat;\nconst test = [client, React];',
          },
        ],
        imports: [
          {
            name: ['Pets', 'Cat'],
            path: './Pets.ts',
            isTypeOnly: true,
          },
          {
            name: 'client',
            path: './Pets.ts',
          },
          {
            name: 'React',
            path: './React.ts',
          },
          {
            name: ['Pets', 'Cat'],
            path: './Pets.ts',
            isTypeOnly: true,
          },
        ],
      }),
    )

    expect(await format(code)).toMatchSnapshot()
    expect(await format(codeWithDefaultImport)).toMatchSnapshot()
    expect(await format(codeWithDefaultImportOrder)).toMatchSnapshot()
  })

  test('if getFileSource is returning code with imports and default import', async () => {
    const code = await parseFile(
      createFile({
        baseName: 'test.ts',
        path: 'models/ts/test.ts',
        sources: [
          {
            value: 'export type Pet = Pets;',
          },
        ],
        imports: [
          {
            name: 'Pets',
            path: './Pets.ts',
            isTypeOnly: true,
          },
        ],
      }),
    )
    expect(await format(code)).toMatchSnapshot()
  })

  test('if getFileSource is returning code with exports and exports as', async () => {
    const fileImport = createFile({
      path: './src/models/file1.ts',
      baseName: 'file1.ts',
      sources: [
        {
          value: `export const test = 2;
        type Test = Pets | Lily | Dog;`,
        },
      ],
      imports: [
        {
          name: ['Pets'],
          path: './Pets.ts',
          isTypeOnly: true,
        },
        {
          name: ['Lily'],
          path: './Pets.ts',
          isTypeOnly: true,
        },
        {
          name: 'Dog',
          path: './Dog.ts',
          isTypeOnly: true,
        },
      ],
    })

    const fileExport = createFile({
      path: './src/models/file1.ts',
      baseName: 'file1.ts',
      sources: [],
      exports: [
        {
          name: ['Pets'],
          path: './Pets.ts',
          isTypeOnly: true,
        },
        {
          name: ['Lily'],
          path: './Pets.ts',
          isTypeOnly: true,
        },
        {
          name: 'Dog',
          asAlias: true,
          path: './Dog.ts',
          isTypeOnly: true,
        },
      ],
    })

    expect(await format(await parseFile(fileImport))).toMatchSnapshot()
    expect(await format(await parseFile(fileExport))).toMatchSnapshot()
  })

  test('if combineExports is filtering out duplicated sources(by name)', () => {
    const sources: Array<KubbFile.Source> = [
      {
        name: 'test',
        isTypeOnly: false,
        value: 'const test = 2',
      },
      {
        name: 'test',
        isTypeOnly: false,
        value: 'const test = 3',
      },
      {
        name: 'Test',
        isTypeOnly: false,
        value: 'type Test = 2',
      },
    ]

    expect(combineSources(sources)).toMatchInlineSnapshot(`
      [
        {
          "isTypeOnly": false,
          "name": "test",
          "value": "const test = 2",
        },
        {
          "isTypeOnly": false,
          "name": "test",
          "value": "const test = 3",
        },
        {
          "isTypeOnly": false,
          "name": "Test",
          "value": "type Test = 2",
        },
      ]
    `)
  })

  test('if combineExports is filtering out duplicated exports(by path and name)', () => {
    const exports: Array<KubbFile.Export> = [
      {
        path: './models',
        name: undefined,
        isTypeOnly: true,
      },
      {
        path: './models',
        isTypeOnly: false,
      },
      {
        path: './models',
        isTypeOnly: false,
        asAlias: true,
        name: 'test',
      },
    ]

    expect(combineExports(exports)).toMatchInlineSnapshot(`
      [
        {
          "isTypeOnly": true,
          "name": undefined,
          "path": "./models",
        },
        {
          "asAlias": true,
          "isTypeOnly": false,
          "name": "test",
          "path": "./models",
        },
      ]
    `)
  })

  test('if combineImports is filtering out duplicated imports(by path and name)', () => {
    const imports: Array<KubbFile.Import> = [
      {
        path: './models',
        name: 'models',
        isTypeOnly: true,
      },
      {
        path: './models',
        name: ['Config'],
        isTypeOnly: true,
      },
      {
        path: './models',
        name: 'models',
        isTypeOnly: false,
      },
    ]

    expect(combineImports(imports, [], 'const test = models; type Test = Config;')).toMatchInlineSnapshot(`
      [
        {
          "isTypeOnly": true,
          "name": "models",
          "path": "./models",
        },
        {
          "isTypeOnly": true,
          "name": [
            "Config",
          ],
          "path": "./models",
        },
      ]
    `)

    const importsWithoutSource: Array<KubbFile.Import> = [
      {
        path: './models',
        name: 'models',
        isTypeOnly: true,
      },
      {
        path: './models',
        name: ['Config'],
        isTypeOnly: true,
      },
      {
        path: './models',
        name: 'models',
        isTypeOnly: false,
      },
    ]

    expect(combineImports(importsWithoutSource, [])).toEqual([imports[0], imports[1]])
  })
})
