import { beforeEach, describe, expect, test, vi } from 'vitest'

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

vi.mock('./FileManager.ts', () => ({
  FileManager: hoisted.FileManagerMock,
}))

import { defineFabric } from './defineFabric.ts'
import type { App } from './App.ts'
import type * as KubbFile from './KubbFile.ts'
import { createParser } from './parsers'
import { createPlugin } from './plugins'

declare global {
  namespace Kubb {
    interface App {
      installedSync: boolean
      installedAsync: boolean
      hello(): string
    }
  }
}

describe('defineApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('creates an fabric and calls instance with fabric when provided', async () => {
    const instance = vi.fn()

    const createFabric = defineFabric(instance)
    const fabric = createFabric()

    expect(typeof fabric.addFile).toBe('function')
    expect(typeof fabric.use).toBe('function')

    expect(instance).toHaveBeenCalledTimes(1)
    expect(instance).toHaveBeenCalledWith(fabric)
  })

  test('addFile proxies to FileManager.add', async () => {
    const fabric = defineFabric()()

    const file = { path: '/tmp/a.ts', baseName: 'a.ts', sources: [] as any[] } as KubbFile.File

    await fabric.addFile(file)
    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(1)
    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledWith(file)
  })

  test('use installs plugin with correct fabric and options; warns on duplicate', async () => {
    const fabric = defineFabric()()

    const install = vi.fn(function (fabric: App, ...opts: any[]) {
      expect(fabric).toBeDefined()
      expect(opts).toEqual(['opt1', 'opt2'])
    })

    const plugin = createPlugin({ name: 'mockPlugin', install })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    fabric.use(plugin, 'opt1', 'opt2')
    expect(install).toHaveBeenCalledTimes(1)

    fabric.use(plugin, 'opt1', 'opt2')
    expect(warnSpy).toHaveBeenCalledWith('Plugin has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  test('use installs parser with correct fabric and options; warns on duplicate', async () => {
    const fabric = defineFabric()()

    const install = vi.fn(function (fabric: App, ...opts: any[]) {
      expect(fabric).toBeDefined()
      expect(opts).toEqual(['a'])
    })

    const parser = createParser<any>({
      name: 'mockParser',
      extNames: [],
      install,
      async parse() {
        return ''
      },
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    fabric.use(parser, 'a')
    expect(install).toHaveBeenCalledTimes(1)

    fabric.use(parser, 'a')
    expect(warnSpy).toHaveBeenCalledWith('Parser has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  test('validate plugin override sync and async', async () => {
    const fabric = defineFabric()()

    const plugin = createPlugin({
      name: 'mockPlugin',
      install() {},
      inject() {
        return {
          write() {
            return 'test'
          },
        }
      },
    })

    fabric.use(plugin)
    await fabric.write()

    expect(fabric.write).toBeDefined()
  })

  test('validate plugin install sync and async', async () => {
    {
      const fabric = defineFabric()()
      const plugin = createPlugin({
        name: 'syncInstall',
        install(fabric) {
          fabric.installedSync = true
        },
      })
      fabric.use(plugin)
      expect(fabric.installedSync).toBe(true)
    }
    {
      const fabric = defineFabric()()
      const plugin = createPlugin({
        name: 'asyncInstall',
        async install(fabric) {
          await Promise.resolve()
          fabric.installedAsync = true
        },
      })
      await fabric.use(plugin)
      expect(fabric.installedAsync).toBe(true)
    }
  })

  test('validate plugin inject sync', async () => {
    const fabric = defineFabric()()
    const plugin = createPlugin({
      name: 'syncInject',
      install() {},
      inject() {
        return {
          hello() {
            return 'world'
          },
        }
      },
    })

    fabric.use(plugin)
    expect(typeof fabric.hello).toBe('function')
    expect(fabric.hello()).toBe('world')
  })
})
