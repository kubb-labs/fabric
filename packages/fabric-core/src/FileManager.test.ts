import path from 'node:path'

import { format } from '../mocks/format.ts'
import { FileManager, combineExports, combineImports, combineSources, createFile } from './FileManager.ts'

import type * as KubbFile from './types.ts'
import { parseFile } from './parsers/parser.ts'

describe('FileManager', () => {
  test('fileManager.add also adds the files to the cache', async () => {
    const fileManager = new FileManager()
    await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    await fileManager.add({
      path: path.resolve('./src/models/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    const files = await fileManager.getFiles()

    expect(files.length).toBe(2)
  })

  test('fileManager.add will return array of files or one file depending on the input', async () => {
    const fileManager = new FileManager()
    const [file, file2] = await fileManager.add(
      {
        path: path.resolve('./src/file1.ts'),
        baseName: 'file1.ts',
        imports: [{ name: 'path', path: 'node:path' }],
        sources: [
          {
            value: "const file1 ='file1';",
          },
        ],
      },
      {
        path: path.resolve('./src/file2.ts'),
        baseName: 'file1.ts',
        imports: [{ name: 'path', path: 'node:path' }],
        sources: [
          {
            value: "const file2 ='file2';",
          },
        ],
      },
    )

    expect(file).toBeDefined()
    expect(file2).toBeDefined()
  })

  test('fileManager.addOrAppend also adds the files to the cache', async () => {
    const fileManager = new FileManager()
    await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      imports: [{ name: 'path', path: 'node:path' }],
      sources: [
        {
          value: "const file1 ='file1';",
        },
      ],
    })

    const [file] = await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      imports: [{ name: 'fs', path: 'node:fs' }],
      sources: [
        {
          value: "const file1Bis ='file1Bis';",
        },
      ],
    })

    expect(file).toBeDefined()
    const files = fileManager.getFiles()

    expect(files.length).toBe(1)

    expect(file?.sources).toMatchInlineSnapshot(`
      [
        {
          "value": "const file1 ='file1';",
        },
        {
          "value": "const file1Bis ='file1Bis';",
        },
      ]
    `)
    expect(file?.imports).toMatchInlineSnapshot(`
      [
        {
          "name": "fs",
          "path": "node:fs",
        },
        {
          "name": "path",
          "path": "node:path",
        },
      ]
    `)
  })
  test('if creation of graph is correct', async () => {
    const fileManager = new FileManager()
    await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })
    await fileManager.add({
      path: path.resolve('./src/hooks/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    await fileManager.add({
      path: path.resolve('./src/models/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    await fileManager.add({
      path: path.resolve('./src/models/file2.ts'),
      baseName: 'file2.ts',
      sources: [],
    })

    const files = await fileManager.getFiles()

    expect(files.length).toBe(4)
  })

  test('fileManager.remove', async () => {
    const fileManager = new FileManager()
    const filePath = path.resolve('./src/file1.ts')
    await fileManager.add({
      path: filePath,
      baseName: 'file1.ts',
      sources: [],
    })

    fileManager.deleteByPath(filePath)
    const files = await fileManager.getFiles()

    const expectedRemovedFile = files.find((f) => f.path === filePath)

    expect(expectedRemovedFile).toBeUndefined()
  })
})

describe('FileManager utils', () => {
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
