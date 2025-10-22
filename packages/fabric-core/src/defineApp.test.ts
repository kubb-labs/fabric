import { beforeEach, describe, expect, test, vi } from 'vitest'

import { defineApp, type AppContext } from './defineApp.ts'
import { FileManager } from './FileManager.ts'
import type * as KubbFile from './KubbFile.ts'

const createRenderer = () => {
  const render = vi.fn()
  const renderToString = vi.fn().mockResolvedValue('rendered')
  const waitUntilExit = vi.fn().mockResolvedValue(undefined)
  return { render, renderToString, waitUntilExit }
}

describe('defineApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('creates an app with component and methods; binds context to renderer', async () => {
    const renderer = createRenderer()

    let receivedThis: AppContext | undefined
    let receivedContainer: unknown
    let receivedContext: AppContext | undefined

    const instance = function (this: AppContext, container: unknown, context: AppContext) {
      receivedThis = this
      receivedContainer = container
      receivedContext = context
      return renderer
    }

    const createApp = defineApp(instance)
    const rootComponent = { name: 'Root' }
    const app = createApp(rootComponent)

    expect(app._component).toBe(rootComponent)
    expect(typeof app.render).toBe('function')
    expect(typeof app.renderToString).toBe('function')
    expect(typeof app.addFile).toBe('function')
    expect(typeof app.use).toBe('function')
    expect(typeof app.write).toBe('function')
    expect(typeof app.waitUntilExit).toBe('function')

    expect(receivedThis).toBe(receivedContext)
    expect(receivedContainer).toBe(rootComponent)
  })

  test('render delegates to renderer (sync and async cases)', async () => {
    {
      const renderer = createRenderer()
      const instance = () => renderer
      const app = defineApp(instance)({})

      await app.render()
      expect(renderer.render).toHaveBeenCalledTimes(1)
    }
    {
      const asyncRender = vi.fn().mockResolvedValue(undefined)
      const instance = () => ({ ...createRenderer(), render: asyncRender })
      const app = defineApp(instance)({})

      await app.render()
      expect(asyncRender).toHaveBeenCalledTimes(1)
    }
  })

  test('renderToString returns renderer result', async () => {
    const renderer = createRenderer()
    renderer.renderToString.mockResolvedValue('hello')
    const app = defineApp(() => renderer)({})

    await expect(app.renderToString()).resolves.toBe('hello')
  })

  test('addFile proxies to FileManager.add', async () => {
    const spy = vi.spyOn(FileManager.prototype, 'add').mockResolvedValue([] as any)
    const app = defineApp(() => createRenderer())({})

    const file = { path: '/tmp/a.ts', baseName: 'a.ts', sources: [] as any[] } as KubbFile.File
    await app.addFile(file)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(file)
  })

  test('waitUntilExit delegated from renderer', async () => {
    const renderer = createRenderer()
    const app = defineApp(() => renderer)({})

    await app.waitUntilExit()
    expect(renderer.waitUntilExit).toHaveBeenCalledTimes(1)
  })

  test('use installs plugin with correct context and options; warns on duplicate', async () => {
    const renderer = createRenderer()
    const app = defineApp(() => renderer)({})

    const install = vi.fn(function (this: AppContext, ctx: AppContext, ...opts: any[]) {
      expect(this).toBe(ctx)
      expect(opts).toEqual(['opt1', 'opt2'])
    })

    const plugin = { type: 'plugin' as const, name: 'mockPlugin', install }

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    app.use(plugin as any, 'opt1', 'opt2')
    expect(install).toHaveBeenCalledTimes(1)

    // duplicate usage should warn and not reinstall
    app.use(plugin as any, 'opt1', 'opt2')
    expect(warnSpy).toHaveBeenCalledWith('Plugin has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(1)
  })

  test('use installs parser with correct context and options; warns on duplicate', async () => {
    const renderer = createRenderer()
    const app = defineApp(() => renderer)({})

    const install = vi.fn(function (this: AppContext, ctx: AppContext, ...opts: any[]) {
      expect(this).toBe(ctx)
      expect(opts).toEqual(['a'])
    })

    const parser = { type: 'parser' as const, name: 'mockParser', install, print: vi.fn() }

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    app.use(parser as any, 'a')
    expect(install).toHaveBeenCalledTimes(1)

    app.use(parser as any, 'a')
    expect(warnSpy).toHaveBeenCalledWith('Parser has already been applied to target app.')
    expect(install).toHaveBeenCalledTimes(1)
  })
})
