import path from 'node:path'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as GraphPluginModule from './graphPlugin.ts'
import { graphPlugin } from './graphPlugin.ts'
import { defineApp } from '../defineApp.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'

function makeFiles(count = 3): KubbFile.ResolvedFile[] {
  const files: KubbFile.ResolvedFile[] = [] as any
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

  test('creates graph.json and graph.html on write:start', async () => {
    const app = defineApp()()
    await app.use(graphPlugin, { root: 'src', open: false })

    const files = makeFiles(2)

    await app.context.events.emit('write:start', { files })

    const graphJson = app.files.find((item) => item.baseName === 'graph.json')
    const graphHtml = app.files.find((item) => item.baseName === 'graph.html')

    expect(graphJson).toBeDefined()
    expect(graphJson?.sources).toMatchSnapshot()

    expect(graphHtml).toBeDefined()
    expect(graphHtml?.sources).toMatchSnapshot()
  })

  test('does nothing when getGraph returns undefined', async () => {
    const app = defineApp()()
    await app.use(graphPlugin, { root: 'out' })

    const files = makeFiles(1)

    const addSpy = vi.spyOn(app.context.fileManager, 'add')
    vi.spyOn(GraphPluginModule, 'getGraph').mockReturnValue(undefined)

    await app.context.events.emit('write:start', { files })

    expect(addSpy).not.toHaveBeenCalled()
  })
})
