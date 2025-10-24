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

import { defineApp } from './defineApp.ts'
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

  test('creates an app and calls instance with app when provided', async () => {
    const instance = vi.fn()

    const createApp = defineApp(instance)
    const app = createApp()

    expect(typeof app.addFile).toBe('function')
    expect(typeof app.use).toBe('function')

    expect(instance).toHaveBeenCalledTimes(1)
    expect(instance).toHaveBeenCalledWith(app)
  })

  test('addFile proxies to FileManager.add', async () => {
    const app = defineApp()()

    const file = { path: '/tmp/a.ts', baseName: 'a.ts', sources: [] as any[] } as KubbFile.File

    await app.addFile(file)
    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledTimes(1)
    expect(hoisted.fileManagerInstance.add).toHaveBeenCalledWith(file)
  })

  test('use installs plugin with correct app and options; warns on duplicate', async () => {
    const app = defineApp()()

    const install = vi.fn(function (app: App, ...opts: any[]) {
      expect(app).toBeDefined()
      expect(opts).toEqual(['opt1', 'opt2'])
    })

    const plugin = createPlugin({ name: 'mockPlugin', install })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    app.use(plugin, 'opt1', 'opt2')
    expect(install).toHaveBeenCalledTimes(1)

    app.use(plugin, 'opt1', 'opt2')
    expect(warnSpy).toHaveBeenCalledWith('Plugin has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  test('use installs parser with correct app and options; warns on duplicate', async () => {
    const app = defineApp()()

    const install = vi.fn(function (app: App, ...opts: any[]) {
      expect(app).toBeDefined()
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

    app.use(parser, 'a')
    expect(install).toHaveBeenCalledTimes(1)

    app.use(parser, 'a')
    expect(warnSpy).toHaveBeenCalledWith('Parser has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  test('validate plugin override sync and async', async () => {
    const app = defineApp()()

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

    app.use(plugin)
    await app.write()

    expect(app.write).toBeDefined()
  })

  test('validate plugin install sync and async', async () => {
    {
      const app = defineApp()()
      const plugin = createPlugin({
        name: 'syncInstall',
        install(app) {
          app.installedSync = true
        },
      })
      app.use(plugin)
      expect(app.installedSync).toBe(true)
    }
    {
      const app = defineApp()()
      const plugin = createPlugin({
        name: 'asyncInstall',
        async install(app) {
          await Promise.resolve()
          app.installedAsync = true
        },
      })
      await app.use(plugin)
      expect(app.installedAsync).toBe(true)
    }
  })

  test('validate plugin inject sync', async () => {
    const app = defineApp()()
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

    app.use(plugin)
    expect(typeof app.hello).toBe('function')
    expect(app.hello()).toBe('world')
  })
})
