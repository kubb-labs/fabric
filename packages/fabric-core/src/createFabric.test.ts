import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFabric } from './createFabric.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { defineParser } from './parsers/defineParser.ts'
import { typescriptParser } from './parsers/typescriptParser.ts'
import { definePlugin } from './plugins/definePlugin.ts'
import { fsPlugin } from './plugins/fsPlugin.ts'
import type { FabricContext, KubbFile } from './types.ts'

declare global {
  namespace Kubb {
    interface Fabric {
      installedSync: boolean
      installedAsync: boolean
      hello(): string
    }
  }
}

describe('createFabric', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a fabric with the fsPlugin and call write on progress', async () => {
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(typescriptParser, 'parse')
    const testPath = path.join(tmpdir(), 'index.ts')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })
    fabric.use(typescriptParser)

    await fabric.addFile({
      baseName: 'index.ts',
      path: testPath,
      sources: [
        {
          value: 'export const x = 1',
          isExportable: true,
        },
      ],
      imports: [],
      exports: [],
    })

    await fabric.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith(testPath, expect.stringContaining('export const x = 1'))
    expect(spy).toHaveBeenCalled()
  })

  it('should call default parser when no extensions are set', async () => {
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(defaultParser, 'parse')
    const testPath = path.join(tmpdir(), 'index.ts')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })

    await fabric.addFile({
      baseName: 'index.ts',
      path: testPath,
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
      imports: [],
      exports: [],
    })

    await fabric.write()

    expect(onBeforeWrite).toHaveBeenCalledWith(testPath, 'export const y = 2')
    expect(spy).toHaveBeenCalled()
  })

  it('should not call write when fsPlugin is in dryRun mode', async () => {
    const onBeforeWrite = vi.fn()
    const testPath = path.join(tmpdir(), 'index.ts')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: true })

    await fabric.addFile({
      baseName: 'index.ts',
      path: testPath,
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
      imports: [],
      exports: [],
    })

    await fabric.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith(testPath, undefined)
  })

  it('should create a fabric with the fsPlugin and parser for vue', async () => {
    const onBeforeWrite = vi.fn()
    const testPath = path.join(tmpdir(), 'index.vue')

    const vueParser = defineParser({
      name: 'vue',
      extNames: ['.vue'],
      install() {},
      async parse(file) {
        return file.sources.map((source) => source.value).join('')
      },
    })

    const spy = vi.spyOn(vueParser, 'parse')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })
    fabric.use(vueParser)

    await fabric.addFile({
      baseName: 'index.vue',
      path: testPath,
      sources: [
        {
          value: '<script>const test = 2;<script>',
          isExportable: true,
        },
      ],
      imports: [],
      exports: [],
    })

    await fabric.write({ extension: { '.vue': '.vue' } })

    expect(onBeforeWrite).toHaveBeenCalledWith(testPath, '<script>const test = 2;<script>')

    expect(spy).toHaveBeenCalled()
  })

  it('should proxy addFile to FileManager.add', async () => {
    const fabric = createFabric()
    const testPath = path.join(tmpdir(), 'a.ts')

    const file = {
      path: testPath,
      baseName: 'a.ts',
      sources: [],
      imports: [],
      exports: [],
    } as KubbFile.File

    const spy = vi.spyOn(fabric.context.fileManager, 'add')

    await fabric.addFile(file)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(file)
  })

  it('should install plugin with correct fabric and options and warn on duplicate', async () => {
    const fabric = createFabric()
    const install = vi.fn(function (ctx: FabricContext, ...opts: any[]) {
      expect(ctx).toBeDefined()
      expect(opts).toEqual(['opt1', 'opt2'])
    })

    const plugin = definePlugin({ name: 'mockPlugin', install })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    fabric.use(plugin, 'opt1', 'opt2')
    expect(install).toHaveBeenCalledTimes(1)
    fabric.use(plugin, 'opt1', 'opt2')
    expect(warnSpy).toHaveBeenCalledWith('Plugin "mockPlugin" already applied.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  it('should install parser with correct fabric and options and warn on duplicate', async () => {
    const fabric = createFabric()
    const install = vi.fn(function (ctx: FabricContext, ...opts: any[]) {
      expect(ctx).toBeDefined()
      expect(opts).toEqual(['a'])
    })

    const parser = defineParser<any>({
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
    expect(warnSpy).toHaveBeenCalledWith('Parser "mockParser" already applied.')
    expect(install).toHaveBeenCalledTimes(2)
  })

  it('should validate plugin override sync', async () => {
    const fabric = createFabric()
    const plugin = definePlugin({
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

  it('should validate plugin install sync', async () => {
    const fabric = createFabric()
    const plugin = definePlugin({
      name: 'syncInstall',
      install() {},
      inject() {
        return {
          installedSync: true,
        }
      },
    })
    fabric.use(plugin)
    expect(fabric.installedSync).toBe(true)
  })

  it('should validate plugin inject sync', async () => {
    const fabric = createFabric()
    const plugin = definePlugin({
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

  describe('unmount', () => {
    it('should remove all event listeners on unmount', () => {
      const fabric = createFabric()
      const handler = vi.fn()

      fabric.context.on('lifecycle:start', handler)
      fabric.unmount()

      // After unmount, emitting should not invoke the handler
      fabric.context.emit('lifecycle:start')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should be safe to call unmount multiple times', () => {
      const fabric = createFabric()

      expect(() => {
        fabric.unmount()
        fabric.unmount()
      }).not.toThrow()
    })

    it('should accept an optional error argument', () => {
      const fabric = createFabric()

      expect(() => fabric.unmount(new Error('test'))).not.toThrow()
      expect(() => fabric.unmount(1)).not.toThrow()
      expect(() => fabric.unmount(null)).not.toThrow()
    })

    it('should remove listeners for multiple event types', () => {
      const fabric = createFabric()
      const startHandler = vi.fn()
      const endHandler = vi.fn()

      fabric.context.on('lifecycle:start', startHandler)
      fabric.context.on('lifecycle:end', endHandler)
      fabric.unmount()

      fabric.context.emit('lifecycle:start')
      fabric.context.emit('lifecycle:end')

      expect(startHandler).not.toHaveBeenCalled()
      expect(endHandler).not.toHaveBeenCalled()
    })
  })
})
