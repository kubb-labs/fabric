import path from 'node:path'

import { FileManager } from './FileManager.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

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

    const files = fileManager.files

    expect(files.length).toBe(2)
  })

  test('fileManager.add resolves path via events', async () => {
    const events = new AsyncEventEmitter()
    events.on('file:resolve:path', ({ value, set }) => {
      if (!value) {
        return
      }
      const parsed = path.parse(value)
      set(path.join(parsed.dir, `${parsed.name}.generated${parsed.ext}`))
    })

    const fileManager = new FileManager({ events })
    const [file] = await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    expect(file!.path).toBe(path.resolve('./src/file1.generated.ts'))
    expect(file!.baseName).toBe('file1.generated.ts')
  })

  test('fileManager.add resolves name via events', async () => {
    const events = new AsyncEventEmitter()
    events.on('file:resolve:name', ({ value, set }) => {
      if (!value) {
        return
      }
      set(`prefix-${value}`)
    })

    const fileManager = new FileManager({ events })
    const [file] = await fileManager.add({
      path: path.resolve('./src/file1.ts'),
      baseName: 'file1.ts',
      sources: [],
    })

    expect(file!.name).toBe('prefix-file1')
    expect(file!.baseName).toBe('file1.ts')
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
    const files = fileManager.files

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

    const files = fileManager.files

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
    const files = fileManager.files

    const expectedRemovedFile = files.find((f) => f.path === filePath)

    expect(expectedRemovedFile).toBeUndefined()
  })

  test('fileManager.processor.run', async () => {
    const events = new AsyncEventEmitter()
    const fileManager = new FileManager({ events })
    let processStart = 0
    let processEnd = 0
    let fileStart = 0
    let fileEnd = 0
    let progress = 0

    await fileManager.add(
      {
        path: path.resolve('./src/a.ts'),
        baseName: 'a.ts',
        sources: [],
      },
      {
        path: path.resolve('./src/b.ts'),
        baseName: 'b.ts',
        sources: [],
      },
    )

    events.on('process:start', () => {
      processStart++
    })
    events.on('process:end', () => {
      processEnd++
    })
    events.on('file:start', () => {
      fileStart++
    })
    events.on('file:end', () => {
      fileEnd++
    })
    events.on('process:progress', () => {
      progress++
    })

    const files = fileManager.files
    const result = await fileManager.processor.run(files)

    expect(result).toBe(files)
    expect(processStart).toBe(1)
    expect(processEnd).toBe(1)
    expect(fileStart).toBe(files.length)
    expect(fileEnd).toBe(files.length)
    expect(progress).toBe(files.length)
  })
})
