import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'
import { barrelPlugin, getBarrelFiles } from './barrelPlugin.ts'

const files = [
  createFile({
    path: 'src/a.ts',
    baseName: 'a.ts',
    sources: [{ name: 'A', isExportable: true, isIndexable: true }],
  }),
  createFile({
    path: 'src/sub/sub2/b.ts',
    baseName: 'b.ts',
    sources: [{ name: 'b', isExportable: true, isIndexable: true }],
  }),
  createFile({
    path: 'src/sub/sub2/c.ts',
    baseName: 'c.ts',
    sources: [{ name: 'C', isExportable: false, isIndexable: false }],
  }),
  createFile({
    path: 'src/sub/d.ts',
    baseName: 'd.ts',
    sources: [
      { name: 'D', isExportable: true, isIndexable: true },
      { name: 'E', isExportable: true, isIndexable: true, isTypeOnly: true },
    ],
  }),
  createFile({
    path: 'src/sub/index.ts',
    baseName: 'index.ts',
    sources: [
      {
        name: 'world',
        value: 'export const world = 2;',
        isExportable: true,
        isIndexable: true,
      },
      {
        name: 'hello',
        value: 'export const hello = 2;',
        isExportable: true,
        isIndexable: true,
      },
    ],
  }),
]

describe('getBarrelFiles', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  it("should produce wildcard exports and mark barrel sources indexable/exportable when mode is 'all'", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'all' })

    expect(barrelFiles.flatMap((item) => item.exports)).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every((s) => s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(6)
  })

  it("should produce named exports and mark barrel sources indexable/exportable when mode is 'named'", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'named' })

    expect(barrelFiles.flatMap((item) => item.exports)).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every((s) => s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(6)
  })

  it("should not generate any barrel files when mode is 'propagate'", () => {
    const barrelFiles = getBarrelFiles({
      files,
      root: 'src',
      mode: 'propagate',
    })
    expect(barrelFiles.length).toBe(0)
  })

  it('should not generate any barrel files when mode is false', () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: false })
    expect(barrelFiles.length).toBe(0)
  })
})

describe('barrelPlugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  it("should produce wildcard exports and mark barrel sources indexable/exportable when mode is 'all'", async () => {
    const fabric = createFabric()

    await fabric.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await fabric.addFile(...files)

    const addSpy = vi.spyOn(fabric.context.fileManager, 'add')

    await fabric.writeEntry({
      root: 'src',
      mode: 'all',
    })

    const [calledArg] = addSpy.mock.calls[0] as any
    const file = calledArg as KubbFile.ResolvedFile

    expect(addSpy).toHaveBeenCalledTimes(2)
    expect(file.baseName).toBe('index.ts')
    expect(file.exports).toMatchSnapshot()
  })

  it("should produce named exports and mark barrel sources indexable/exportable when mode is 'named'", async () => {
    const fabric = createFabric()

    fabric.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await fabric.addFile(...files)

    const addSpy = vi.spyOn(fabric.context.fileManager, 'add')

    await fabric.writeEntry({
      root: 'src',
      mode: 'named',
    })

    const [calledArg] = addSpy.mock.calls[0] as any
    const file = calledArg as KubbFile.ResolvedFile

    expect(addSpy).toHaveBeenCalledTimes(2)
    expect(file.baseName).toBe('index.ts')
    expect(file.exports).toMatchSnapshot()
  })

  it("should not generate any barrel files when mode is 'propagate'", async () => {
    const fabric = createFabric()

    await fabric.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await fabric.addFile(...files)

    const addSpy = vi.spyOn(fabric.context.fileManager, 'add')

    await fabric.writeEntry({
      root: 'src',
      mode: 'propagate',
    })

    expect(addSpy).toHaveBeenCalledTimes(0)
  })
  it('should not generate any barrel files when mode is false', async () => {
    const fabric = createFabric()

    fabric.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await fabric.addFile(...files)

    const addSpy = vi.spyOn(fabric.context.fileManager, 'add')

    await fabric.writeEntry({
      root: 'src',
      mode: false,
    })

    expect(addSpy).toHaveBeenCalledTimes(0)
  })
})
