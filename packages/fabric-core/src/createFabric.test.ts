import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createFabric } from './createFabric.ts'
import { fsPlugin } from './plugins/fsPlugin.ts'
import { defaultParser } from './parsers/defaultParser.ts'
import { typescriptParser } from './parsers/typescriptParser.ts'
import { createParser } from './parsers/createParser.ts'

describe('createFabric', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('creates an fabric with the fsPlugin and calls write on progress', async () => {
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(typescriptParser, 'parse')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })
    fabric.use(typescriptParser)

    await fabric.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const x = 1',
          isExportable: true,
        },
      ],
    })

    await fabric.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', expect.stringContaining('export const x = 1'))
    expect(spy).toHaveBeenCalled()
  })

  test('call default parser when no extension are set', async () => {
    const onBeforeWrite = vi.fn()
    const spy = vi.spyOn(defaultParser, 'parse')

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })

    await fabric.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
    })

    await fabric.write()

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', 'export const y = 2')
    expect(spy).toHaveBeenCalled()
  })

  test('does not call write when fsPlugin is in dryRun mode', async () => {
    const onBeforeWrite = vi.fn()

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: true })

    await fabric.addFile({
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      sources: [
        {
          value: 'export const y = 2',
          isExportable: true,
        },
      ],
    })

    await fabric.write({ extension: { '.ts': '.ts' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.ts', undefined)
  })

  test('creates an fabric with the fsPlugin and parser for vue', async () => {
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

    const fabric = createFabric()
    fabric.use(fsPlugin, { onBeforeWrite, dryRun: false })
    fabric.use(vueParser)

    await fabric.addFile({
      baseName: 'index.vue',
      path: '/tmp/index.vue',
      sources: [
        {
          value: '<script>const test = 2;<script>',
          isExportable: true,
        },
      ],
    })

    await fabric.write({ extension: { '.vue': '.vue' } })

    expect(onBeforeWrite).toHaveBeenCalledWith('/tmp/index.vue', '<script>const test = 2;<script>')

    expect(spy).toHaveBeenCalled()
  })
})
