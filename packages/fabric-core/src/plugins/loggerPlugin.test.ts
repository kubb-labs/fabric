import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'

const hoisted = vi.hoisted(() => {
  const progressMock = {
    start: vi.fn(),
    advance: vi.fn(),
    stop: vi.fn(),
  }

  const spinnerMock = {
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn(),
  }

  const log = {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    step: vi.fn(),
    message: vi.fn(),
  }

  return {
    progressMock,
    spinnerMock,
    log,
    intro: vi.fn(),
    outro: vi.fn(),
    spinner: vi.fn(() => spinnerMock),
    progress: vi.fn(() => progressMock),
  }
})

vi.mock('@clack/prompts', () => ({
  intro: hoisted.intro,
  outro: hoisted.outro,
  spinner: hoisted.spinner,
  progress: hoisted.progress,
  log: hoisted.log,
}))

vi.mock('picocolors', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    yellow: (str: string) => str,
    dim: (str: string) => str,
  },
}))

const { progressMock, spinnerMock, log, intro, outro } = hoisted

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
  })

  it('should use clack for logging', async () => {
    const fabric = createFabric()

    await fabric.use(loggerPlugin, { websocket: false })

    await fabric.context.emit('lifecycle:start')
    expect(intro).toHaveBeenCalledWith(expect.stringContaining('Fabric'))

    await fabric.context.emit('lifecycle:end')
    expect(outro).toHaveBeenCalledWith(expect.stringContaining('Fabric run completed'))
  })

  it('should log key lifecycle events with clack', async () => {
    const fabric = createFabric()

    await fabric.use(loggerPlugin, { websocket: false })

    log.step.mockClear()
    log.info.mockClear()
    log.success.mockClear()

    await fabric.context.emit('lifecycle:start')
    expect(intro).toHaveBeenCalled()

    const file = makeFile()

    await fabric.context.emit('files:processing:start', [file])
    expect(log.step).toHaveBeenCalledWith(expect.stringContaining('Processing'))

    log.step.mockClear()

    await fabric.context.emit('file:processing:update', {
      processed: 1,
      total: 1,
      percentage: 100,
      file,
    })
    expect(log.step).toHaveBeenCalledWith(expect.stringContaining('Progress'))
    expect(log.step).toHaveBeenCalledWith(expect.stringContaining('100.0%'))

    log.success.mockClear()

    await fabric.context.emit('file:processing:end', file, 0, 1)
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining('Finished'))

    outro.mockClear()

    await fabric.context.emit('lifecycle:end')
    expect(outro).toHaveBeenCalledWith(expect.stringContaining('Fabric run completed'))
  })

  describe('progress option', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should start and update progress bar when enabled', async () => {
      const fabric = createFabric()

      await fabric.use(loggerPlugin, { websocket: false })

      const files = makeFiles(2)

      await fabric.context.emit('files:processing:start', files)
      expect(progressMock.start).toHaveBeenCalledWith(expect.stringContaining('Processing'))

      for (const file of files) {
        await fabric.context.emit('file:processing:update', {
          processed: 1,
          total: files.length,
          percentage: 50,
          file,
        })
      }

      expect(progressMock.advance).toHaveBeenCalledTimes(2)

      await fabric.context.emit('files:processing:end', files)
      expect(progressMock.stop).toHaveBeenCalled()
    })

    it('should not create progress bar when disabled', async () => {
      const fabric = createFabric()

      await fabric.use(loggerPlugin, { websocket: false, progress: false })

      const files = makeFiles(1)
      const [file] = files
      if (!file) {
        throw new Error('Expected at least one file')
      }

      await fabric.context.emit('files:processing:start', files)
      await fabric.context.emit('file:processing:update', {
        processed: 1,
        total: 1,
        percentage: 100,
        file,
      })
      await fabric.context.emit('files:processing:end', files)

      expect(progressMock.start).not.toHaveBeenCalled()
      expect(progressMock.advance).not.toHaveBeenCalled()
      expect(progressMock.stop).not.toHaveBeenCalled()
    })
  })
})
