import { SingleBar } from 'cli-progress'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'

const hoisted = vi.hoisted(() => {
  const logger = {
    withTag: vi.fn(),
    start: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    pauseLogs: vi.fn(),
    resumeLogs: vi.fn(),
  }

  logger.withTag.mockReturnValue(logger)

  const createConsolaMock = vi.fn(() => logger)

  return { logger, createConsolaMock }
})

vi.mock('consola', () => ({
  createConsola: hoisted.createConsolaMock,
}))

const { logger, createConsolaMock } = hoisted

import { loggerPlugin } from './loggerPlugin.ts'

function makeFile(name = 'example'): KubbFile.ResolvedFile {
  return createFile({
    path: `src/${name}.ts`,
    baseName: `${name}.ts`,
    sources: [
      {
        name,
        value: `export const ${name} = 1`,
        isExportable: true,
      },
    ],
  })
}

function makeFiles(count: number): KubbFile.ResolvedFile[] {
  return Array.from({ length: count }, (_, index) => makeFile(`file${index}`))
}

describe('loggerPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    logger.withTag.mockReturnValue(logger)
  })

  test('configures consola with Fabric tag', async () => {
    const fabric = createFabric()

    await fabric.use(loggerPlugin, { websocket: false })

    expect(createConsolaMock).toHaveBeenCalledWith({})
    expect(logger.withTag).toHaveBeenCalledWith('Fabric')
  })

  test('logs key lifecycle events to consola', async () => {
    const fabric = createFabric()

    await fabric.use(loggerPlugin, { websocket: false })

    logger.start.mockClear()
    logger.info.mockClear()
    logger.success.mockClear()

    await fabric.context.emit('lifecycle:start')
    expect(logger.start).toHaveBeenCalledWith('Starting Fabric run')

    logger.start.mockClear()

    const file = makeFile()

    await fabric.context.emit('files:processing:start', { files: [file] })
    expect(logger.start).toHaveBeenCalledWith('Processing 1 file')

    logger.start.mockClear()

    await fabric.context.emit('file:processing:update', {
      processed: 1,
      total: 1,
      percentage: 100,
      file,
    })
    expect(logger.info).toHaveBeenCalledWith('Progress 100.0% (1/1) → src/example.ts')

    logger.info.mockClear()

    await fabric.context.emit('file:processing:end', { file, index: 0, total: 1 })
    expect(logger.success).toHaveBeenCalledWith('Finished [1/1] src/example.ts')

    logger.success.mockClear()

    await fabric.context.emit('lifecycle:end')
    expect(logger.success).toHaveBeenCalledWith('Fabric run completed')
  })

  describe('progress option', () => {
    let startSpy: ReturnType<typeof vi.spyOn>
    let incrementSpy: ReturnType<typeof vi.spyOn>
    let stopSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      startSpy = vi.spyOn(SingleBar.prototype as any, 'start')
      incrementSpy = vi.spyOn(SingleBar.prototype as any, 'increment')
      stopSpy = vi.spyOn(SingleBar.prototype as any, 'stop')
    })

    afterEach(() => {
      startSpy.mockRestore()
      incrementSpy.mockRestore()
      stopSpy.mockRestore()
    })

    test('starts and updates progress bar when enabled', async () => {
      const fabric = createFabric()

      await fabric.use(loggerPlugin, { websocket: false })

      const files = makeFiles(2)

      await fabric.context.emit('files:processing:start', { files })
      expect(startSpy).toHaveBeenCalledWith(2, 0, { message: 'Starting...' })

      for (const file of files) {
        await fabric.context.emit('file:processing:update', {
          processed: 1,
          total: files.length,
          percentage: 50,
          file,
        })
      }

      expect(incrementSpy).toHaveBeenCalledTimes(2)

      await fabric.context.emit('files:processing:end', { files })
      expect(stopSpy).toHaveBeenCalled()
    })

    test('does not create progress bar when disabled', async () => {
      const fabric = createFabric()

      await fabric.use(loggerPlugin, { websocket: false, progress: false })

      const files = makeFiles(1)
      const [file] = files
      if (!file) {
        throw new Error('Expected at least one file')
      }

      await fabric.context.emit('files:processing:start', { files })
      await fabric.context.emit('file:processing:update', {
        processed: 1,
        total: 1,
        percentage: 100,
        file,
      })
      await fabric.context.emit('files:processing:end', { files })

      expect(startSpy).not.toHaveBeenCalled()
      expect(incrementSpy).not.toHaveBeenCalled()
      expect(stopSpy).not.toHaveBeenCalled()
    })
  })
})
