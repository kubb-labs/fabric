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
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(typescriptParser, 'parse')

    const app = createApp()
    app.use(fsPlugin, { onBeforeWrite, dryRun: false })
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

    await app.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', expect.stringContaining('export const x = 1'))
    expect(spy).toHaveBeenCalled()
  })

  test('call default parser when no extension are set', async () => {
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(defaultParser, 'parse')

    const app = createApp()
    app.use(fsPlugin, { onBeforeWrite, dryRun: false })

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

    await app.write()

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', 'export const y = 2')
    expect(spy).toHaveBeenCalled()
  })

  test('does not call write when fsPlugin is in dryRun mode', async () => {
    const onBeforeWrite = vi.fn()

    const app = createApp()
    app.use(fsPlugin, { onBeforeWrite, dryRun: true })

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

    await app.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', undefined)
  })

  test('creates an app with the fsPlugin and parser for vue', async () => {
    const onBeforeWrite = vi.fn()

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
    app.use(fsPlugin, { onBeforeWrite, dryRun: false })
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

    await app.write({ extension: { '.vue': '.vue' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.vue', '<script>const test = 2;<script>')

    expect(spy).toHaveBeenCalled()
  })
})
