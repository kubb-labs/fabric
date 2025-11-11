import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createFile } from '../createFile.ts'
import { defineFabric } from '../defineFabric.ts'
import type * as KubbFile from '../KubbFile.ts'

const hoisted = vi.hoisted(() => {
  const logger = {
    withTag: vi.fn(),
    start: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }

  logger.withTag.mockReturnValue(logger)

  const createMock = vi.fn(() => logger)

  return { logger, createMock }
})

vi.mock('consola', () => ({
  default: { create: hoisted.createMock },
  consola: { create: hoisted.createMock },
  create: hoisted.createMock,
}))

const { logger, createMock } = hoisted

import { consolePlugin } from './consolePlugin.ts'

function makeFile(): KubbFile.ResolvedFile {
  return createFile({
    path: 'src/example.ts',
    baseName: 'example.ts',
    sources: [
      {
        name: 'example',
        value: 'export const value = 1',
        isExportable: true,
      },
    ],
  })
}

describe('consolePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    logger.withTag.mockReturnValue(logger)
  })

  test('configures consola with fancy output and Fabric tag', async () => {
    const fabric = defineFabric()()

    await fabric.use(consolePlugin, { websocket: false })

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fancy: true,
      }),
    )
    expect(logger.withTag).toHaveBeenCalledWith('Fabric')
  })

  test('logs key lifecycle events to consola', async () => {
    const fabric = defineFabric()()

    await fabric.use(consolePlugin, { websocket: false })

    logger.start.mockClear()
    logger.info.mockClear()
    logger.success.mockClear()

    await fabric.context.emit('start')
    expect(logger.start).toHaveBeenCalledWith('Starting Fabric run')

    logger.start.mockClear()

    const file = makeFile()

    await fabric.context.emit('process:start', { files: [file] })
    expect(logger.start).toHaveBeenCalledWith('Processing 1 file')

    logger.start.mockClear()

    await fabric.context.emit('process:progress', {
      processed: 1,
      total: 1,
      percentage: 100,
      file,
    })
    expect(logger.info).toHaveBeenCalledWith('Progress 100.0% (1/1) → src/example.ts')

    logger.info.mockClear()

    await fabric.context.emit('file:end', { file, index: 0, total: 1 })
    expect(logger.success).toHaveBeenCalledWith('Finished [1/1] src/example.ts')

    logger.success.mockClear()

    await fabric.context.emit('end')
    expect(logger.success).toHaveBeenCalledWith('Fabric run completed')
  })
})
