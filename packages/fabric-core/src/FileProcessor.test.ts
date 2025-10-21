import { beforeEach, describe, expect, test, vi } from 'vitest'

import { FileProcessor } from './FileProcessor.ts'
import * as FsMod from './fs.ts'
import type * as KubbFile from './KubbFile.ts'

const makeFile = (overrides: Partial<KubbFile.ResolvedFile> = {}): KubbFile.ResolvedFile =>
  ({
    id: overrides.id ?? '1',
    name: overrides.name ?? 'index',
    baseName: overrides.baseName ?? 'index.ts',
    path: overrides.path ?? '/tmp/index.ts',
    extname: overrides.extname ?? '.ts',
    sources: overrides.sources ?? [],
    imports: overrides.imports ?? [],
    exports: overrides.exports ?? [],
    meta: overrides.meta ?? {},
  }) as any

describe('FileProcessor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('parse and emit hooks', async () => {
    const file = makeFile({ id: 'c', path: '/tmp/c.ts', baseName: 'c.ts', name: 'c' })
    const files = [file]

    const writeSpy = vi.spyOn(FsMod, 'write').mockResolvedValue('IGNORED')

    const processor = new FileProcessor()
    const parseSpy = vi.spyOn(processor as any, 'parse').mockResolvedValue('IGNORED')

    const starts: any[] = []
    const fileStarts: any[] = []
    const fileFinishes: any[] = []
    const finishes: any[] = []

    processor.on('start', (payload) => starts.push(payload))
    processor.on('file:start', (payload) => fileStarts.push(payload))
    processor.on('file:finish', (payload) => fileFinishes.push(payload))
    processor.on('finish', (payload) => finishes.push(payload))

    const result = await processor.run(files, { extension: {} })

    expect(result).toEqual(files)

    expect(starts).toHaveLength(1)
    expect(fileStarts).toHaveLength(1)
    expect(fileFinishes).toHaveLength(1)
    expect(finishes).toHaveLength(1)

    expect(starts[0].files).toEqual(files)
    expect(fileStarts[0].file).toEqual(file)
    expect(fileFinishes[0].file).toEqual(file)
    expect(finishes[0].files).toEqual(files)

    expect(parseSpy).toHaveBeenCalled()
    expect(writeSpy).toHaveBeenCalled()
  })
})
