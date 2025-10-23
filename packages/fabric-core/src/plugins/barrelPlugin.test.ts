import { beforeEach, describe, expect, test, vi } from 'vitest'

import { barrelPlugin, getBarrelFiles } from './barrelPlugin.ts'
import { createFile } from '../createFile.ts'
import { defineApp } from '../defineApp.ts'

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
  test("mode 'all' should produce wildcard exports and mark barrel sources indexable/exportable", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'all' })

    expect(barrelFiles).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every((s) => s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(6)
  })

  test("mode 'named' should produce named exports and mark barrel sources indexable/exportable", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'named' })

    expect(barrelFiles).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every((s) => s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(6)
  })

  test("mode 'propagate' should not generate any barrel files", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'propagate' })
    expect(barrelFiles.length).toBe(0)
  })

  test('mode false should not generate any barrel files', () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: false })
    expect(barrelFiles.length).toBe(0)
  })
})

describe('barrelPlugin', () => {
  const example = {
    baseName: 'index.ts',
    exports: [
      {
        isTypeOnly: false,
        name: undefined,
        path: './a.ts',
      },
      {
        isTypeOnly: false,
        name: undefined,
        path: './sub/d.ts',
      },
      {
        isTypeOnly: false,
        name: undefined,
        path: './sub/d.ts',
      },
      {
        isTypeOnly: false,
        name: undefined,
        path: './sub/index.ts',
      },
      {
        isTypeOnly: false,
        name: undefined,
        path: './sub/index.ts',
      },
      {
        isTypeOnly: false,
        name: undefined,
        path: './sub/sub2/b.ts',
      },
    ],
  }
  const exampleNamed = {
    baseName: 'index.ts',
    exports: [
      {
        isTypeOnly: undefined,
        name: ['A'],
        path: './a.ts',
      },
      {
        isTypeOnly: undefined,
        name: ['D'],
        path: './sub/d.ts',
      },
      {
        isTypeOnly: true,
        name: ['E'],
        path: './sub/d.ts',
      },
      {
        isTypeOnly: undefined,
        name: ['world'],
        path: './sub/index.ts',
      },
      {
        isTypeOnly: undefined,
        name: ['hello'],
        path: './sub/index.ts',
      },
      {
        isTypeOnly: undefined,
        name: ['b'],
        path: './sub/sub2/b.ts',
      },
    ],
    path: '/Users/stijnvanhulle/GitHub/fabric/src/index.ts',
    sources: [],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })
  test("mode 'all' should produce wildcard exports and mark barrel sources indexable/exportable", () => {
    const app = defineApp()()

    app.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    app.addFile(...files)

    const addSpy = vi.spyOn(app.context.fileManager, 'add')

    app.writeEntry({
      root: 'src',
      mode: 'all',
    })

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining(example))
  })

  test("mode 'named' should produce named exports and mark barrel sources indexable/exportable", async () => {
    const app = defineApp()()

    app.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await app.addFile(...files)

    const addSpy = vi.spyOn(app.context.fileManager, 'add')

    await app.writeEntry({
      root: 'src',
      mode: 'named',
    })

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining(exampleNamed))
  })

  test("mode 'propagate' should not generate any barrel files", () => {
    const app = defineApp()()

    app.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    app.addFile(...files)

    const addSpy = vi.spyOn(app.context.fileManager, 'add')

    app.writeEntry({
      root: 'src',
      mode: 'propagate',
    })

    expect(addSpy).toHaveBeenCalledTimes(0)
  })
  test('mode false should not generate any barrel files', async () => {
    const app = defineApp()()

    app.use(barrelPlugin, { mode: 'propagate', root: 'src' })
    await app.addFile(...files)

    const addSpy = vi.spyOn(app.context.fileManager, 'add')

    await app.writeEntry({
      root: 'src',
      mode: false,
    })

    expect(addSpy).toHaveBeenCalledTimes(0)
  })
})
