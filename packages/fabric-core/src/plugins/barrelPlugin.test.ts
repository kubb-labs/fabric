
import {beforeEach, describe, expect, test, vi} from 'vitest'

const hoisted = vi.hoisted(() => {
  const fileManagerInstance = {
    files: [],
    add: vi.fn().mockResolvedValue([] as any),
  }
  class FileManagerMock {
    files = fileManagerInstance.files
    add = fileManagerInstance.add
  }
  return { fileManagerInstance, FileManagerMock }
})

vi.mock('../FileManager.ts', () => ({
  FileManager: hoisted.FileManagerMock,
}))

import {barrelPlugin, getBarrelFiles} from './barrelPlugin.ts'
import { createFile } from '../createFile.ts'
import {defineApp} from "../defineApp.ts";

const files= [
  createFile({
    path: 'src/a.ts',
    baseName: 'a.ts',
    sources: [
      { name: 'A', isExportable: true, isIndexable: true },
    ],
  }),
  createFile({
    path: 'src/sub/sub2/b.ts',
    baseName: 'b.ts',
    sources: [
      { name: 'b', isExportable: true, isIndexable: true },
    ],
  }),
  createFile({
    path: 'src/sub/sub2/c.ts',
    baseName: 'c.ts',
    sources: [
      { name: 'C', isExportable: false, isIndexable: false },
    ],
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
const countFiles = 4
const countSources = 6

describe('getBarrelFiles', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  test("mode 'all' should produce wildcard exports and mark barrel sources indexable/exportable", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'all' })

    expect(barrelFiles).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every(s=>s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(countSources)
  })

  test("mode 'named' should produce named exports and mark barrel sources indexable/exportable", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'named' })

    expect(barrelFiles).toMatchSnapshot()
    expect(barrelFiles.length).toBe(3)

    expect(barrelFiles.every((file) => file.baseName === 'index.ts')).toBeTruthy()
    expect(barrelFiles.every((f) => f.sources.every(s=>s.isIndexable && s.isExportable))).toBe(true)

    const rootIndex = barrelFiles.find((f) => f.path === 'src/index.ts')!
    expect(rootIndex.exports?.length).toBe(countSources)
  })

  test("mode 'propagate' should not generate any barrel files", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: 'propagate' })
    expect(barrelFiles.length).toBe(0)
  })

  test("mode false should not generate any barrel files", () => {
    const barrelFiles = getBarrelFiles({ files, root: 'src', mode: false })
    expect(barrelFiles.length).toBe(0)
  })
})

describe('barrelPlugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  test("mode 'all' should produce wildcard exports and mark barrel sources indexable/exportable", () => {
    const app = defineApp()()

    app.use(barrelPlugin,{mode: "propagate", root:'src'})
    app.addFile(...files)

    app.writeEntry({
      root: 'src',
      mode: 'all'
    })
    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(2)

  })

  test("mode 'named' should produce named exports and mark barrel sources indexable/exportable", async() => {
    const app = defineApp()()

    app.use(barrelPlugin,{mode: "propagate", root:''})
    await app.addFile(...files)

    await app.writeEntry({
      root: 'src',
      mode: 'named'
    })

    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(countFiles)

  })

  test("mode 'propagate' should not generate any barrel files", () => {
    const app = defineApp()()

    app.use(barrelPlugin,{mode: "propagate", root:'src'})
    app.addFile(...files)

    app.writeEntry({
      root: 'src',
      mode: 'propagate'
    })

    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(countSources)

  })
  test("mode false should not generate any barrel files", async () => {
    const app = defineApp()()

    app.use(barrelPlugin,{mode: "propagate", root:'src'})
    await app.addFile(...files)

    await app.writeEntry({
      root: 'src',
      mode: false
    })

    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(files.length)
  })
})

