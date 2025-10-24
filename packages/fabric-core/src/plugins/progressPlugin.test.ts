import path from 'node:path'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { progressPlugin } from './progressPlugin.ts'
import { defineApp } from '../defineApp.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'
import { SingleBar } from 'cli-progress'

let startSpy: ReturnType<typeof vi.spyOn>
let incrementSpy: ReturnType<typeof vi.spyOn>
let stopSpy: ReturnType<typeof vi.spyOn>

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

describe('progressPlugin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    startSpy = vi.spyOn(SingleBar.prototype as any, 'start').mockImplementation(() => undefined as any)
    incrementSpy = vi.spyOn(SingleBar.prototype as any, 'increment').mockImplementation(() => undefined as any)
    stopSpy = vi.spyOn(SingleBar.prototype as any, 'stop').mockImplementation(() => undefined as any)
  })

  test('starts progress bar on process:start with total and initial value 1', async () => {
    const app = defineApp()()
    await app.use(progressPlugin)

    const files = makeFiles(5)

    await app.context.events.emit('process:start', { files })

    expect(startSpy).toHaveBeenCalledWith(5, 0, {
      message: 'Starting...',
    })
  })

  test('increments with message on process:progress for each file', async () => {
    const app = defineApp()()
    await app.use(progressPlugin)

    const files = makeFiles(2)

    await app.context.events.emit('process:start', { files })

    for (const file of files) {
      await app.context.events.emit('process:progress', {
        processed: 0,
        total: files.length,
        percentage: 0,
        source: 'test',
        file,
      })
    }

    expect(incrementSpy).toHaveBeenCalledTimes(2)

    const firstCallArgs = (incrementSpy as any).mock.calls[0]
    expect(firstCallArgs[0]).toBe(1)
    expect(firstCallArgs[1]).toEqual({ message: `Writing ${path.join('src', 'file0.ts')}` })
  })

  test('stops progress bar on process:end', async () => {
    const app = defineApp()()
    await app.use(progressPlugin)

    const files = makeFiles(1)

    await app.context.events.emit('process:start', { files })
    await app.context.events.emit('process:end', { files })

    expect(stopSpy).toHaveBeenCalledTimes(1)
  })
})
