import { describe, expect, test } from 'vitest'
import { createFile } from './createFile.ts'
import { FileProcessor } from './FileProcessor.ts'
import type * as KubbFile from './KubbFile.ts'
import { defaultParser, tsxParser, typescriptParser } from './parsers'
import type { Parser } from './parsers/types.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'

describe('FileProcessor', () => {
  const parsers = new Map<KubbFile.Extname, Parser>([
    ['.ts', typescriptParser],
    ['.js', typescriptParser],
    ['.tsx', tsxParser],
    ['.jsx', tsxParser],
    ['.json', defaultParser],
  ])

  test('parse() uses TypeScript parser for .ts', async () => {
    const processor = new FileProcessor()

    const file = createFile({
      baseName: 'test.ts',
      path: 'models/ts/test.ts',
      imports: [
        {
          name: ['A'],
          path: './a.ts',
          isTypeOnly: true,
        },
      ],
      sources: [
        {
          value: 'export type X = A',
        },
      ],
    })

    const code = await processor.parse(file, { parsers })

    expect(code).toContain('import type { A } from "./a.ts"')
    expect(code).toContain('export type X = A')
  })

  test('parse() uses default parser for .json', async () => {
    const processor = new FileProcessor()

    const file = createFile({
      baseName: 'test.json',
      path: 'models/ts/test.json',
      imports: [],
      sources: [{ value: '{"a":1}' }, { value: '{"b":2}' }],
    })

    const code = await processor.parse(file, { parsers })

    expect(code).toBe('{"a":1}' + '\n\n' + '{"b":2}')
    expect(code.includes('import ')).toBe(false)
  })

  test('run() emits lifecycle events (simple)', async () => {
    const events = new AsyncEventEmitter()
    const processor = new FileProcessor({ events })

    const files = [
      createFile({
        baseName: 'a.ts',
        path: 'models/ts/a.ts',
        sources: [{ value: 'export const a = 1' }],
      }),
      createFile({
        baseName: 'b.ts',
        path: 'models/ts/b.ts',
        sources: [{ value: 'export const b = 2' }],
      }),
    ]

    let processStart = 0
    let processEnd = 0
    let fileStart = 0
    let fileEnd = 0
    let progress = 0

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

    const result = await processor.run(files)

    expect(result).toBe(files as any)
    expect(processStart).toBe(1)
    expect(processEnd).toBe(1)
    expect(fileStart).toBe(files.length)
    expect(fileEnd).toBe(files.length)
    expect(progress).toBe(files.length)
  })
})
