import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createApp } from './createApp.ts'
import { fsPlugin } from './plugins/fsPlugin.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { typescriptParser } from './parsers/typescriptParser.ts'
import { createParser } from './parsers/createParser.ts'

describe('createApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('creates an app with the fsPlugin and calls write on progress', async () => {
    const onWrite = vi.fn()
    const spy = vi.spyOn(typescriptParser, 'parse')

    const app = createApp()
    app.use(fsPlugin, { onWrite })
    app.use(typescriptParser)

    await app.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const x = 1',
          isExportable: true,
        },
      ],
    })

    await app.write({ extension: { '.ts': '.ts' }, dryRun: false })

    expect(onWrite).toHaveBeenCalledWith('/tmp/index.ts', expect.stringContaining('export const x = 1'))
    expect(spy).toHaveBeenCalled()
  })

  test('call default parser when no extension are set', async () => {
    const onWrite = vi.fn()
    const spy = vi.spyOn(defaultParser, 'parse')

    const app = createApp()
    app.use(fsPlugin, { onWrite })

    await app.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
    })

    await app.write({ dryRun: false })

    expect(onWrite).toHaveBeenCalledWith('/tmp/index.ts', 'export const y = 2')
    expect(spy).toHaveBeenCalled()
  })

  test('does not call write when fsPlugin is in dryRun mode', async () => {
    const onWrite = vi.fn()

    const app = createApp()
    app.use(fsPlugin, { onWrite })

    await app.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
    })

    await app.write({ extension: { '.ts': '.ts' }, dryRun: true })

    expect(onWrite).not.toHaveBeenCalled()
  })

  test('creates an app with the fsPlugin and parser for vue', async () => {
    const onWrite = vi.fn()

    const vueParser = createParser({
      name: 'vue',
      extNames: ['.vue'],
      install() {},
      async parse(file) {
        return file.sources.map((source) => source.value).join('')
      },
    })

    const spy = vi.spyOn(vueParser, 'parse')

    const app = createApp()
    app.use(fsPlugin, { onWrite })
    app.use(vueParser)

    await app.addFile({
      baseName: 'index.vue',
      path: '/tmp/index.vue',
      sources: [
        {
          value: '<script>const test = 2;<script>',
          isExportable: true,
        },
      ],
    })

    await app.write({ extension: { '.vue': '.vue' }, dryRun: false })

    expect(onWrite).toHaveBeenCalledWith('/tmp/index.vue', '<script>const test = 2;<script>')

    expect(spy).toHaveBeenCalled()
  })
})
