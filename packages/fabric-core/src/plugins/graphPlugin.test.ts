import path from 'node:path'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'
import * as GraphPluginModule from './graphPlugin.ts'
import { graphPlugin } from './graphPlugin.ts'

function makeFiles(count = 3): KubbFile.ResolvedFile[] {
  const files: KubbFile.ResolvedFile[] = []
  for (let i = 0; i < count; i++) {
    files.push(
      createFile({
        path: path.join('src', `file${i}.ts`),
        baseName: `file${i}.ts`,
        sources: [
          {
            name: `S${i}`,
            value: `export const S${i} = ${i};`,
            isExportable: true,
            isIndexable: true,
          },
        ],
      }),
    )
  }
  return files
}

describe('graphPlugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('creates graph.json and graph.html on files:writing:start', async () => {
    const fabric = createFabric()
    await fabric.use(graphPlugin, { root: 'src', open: false })

    const files = makeFiles(2)

    await fabric.context.emit('files:writing:start', files)

    const graphJson = fabric.files.find((item) => item.baseName === 'graph.json')
    const graphHtml = fabric.files.find((item) => item.baseName === 'graph.html')

    expect(graphJson).toBeDefined()
    expect(graphJson?.sources).toMatchSnapshot()

    expect(graphHtml).toBeDefined()
    expect(graphHtml?.sources).toMatchSnapshot()
  })

  test('does nothing when getGraph returns undefined', async () => {
    const fabric = createFabric()
    await fabric.use(graphPlugin, { root: 'out' })

    const files = makeFiles(1)

    const addSpy = vi.spyOn(fabric.context.fileManager, 'add')
    vi.spyOn(GraphPluginModule, 'getGraph').mockReturnValue(undefined)

    await fabric.context.emit('files:writing:start', files)

    expect(addSpy).not.toHaveBeenCalled()
  })

  test('throws error when options are not provided', async () => {
    const fabric = createFabric()

    await expect(async () => {
      // @ts-expect-error - testing error case
      await fabric.use(graphPlugin)
    }).rejects.toThrow('Graph plugin requires options.root and options.mode')
  })

  test('serves graph when open option is true', async () => {
    const fabric = createFabric()

    // Mock the serve function to avoid actual server start
    vi.mock('../utils/open.ts', () => ({
      open: vi.fn().mockResolvedValue(true),
    }))

    await fabric.use(graphPlugin, { root: 'src', open: true })

    const files = makeFiles(2)

    // This will trigger the serve function
    await fabric.context.emit('files:writing:start', files)

    // Just ensure it doesn't crash when open is true
    expect(fabric.files.length).toBeGreaterThan(0)
  })
})
