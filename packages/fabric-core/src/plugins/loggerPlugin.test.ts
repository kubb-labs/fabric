import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFabric } from '../createFabric.ts'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'

const hoisted = vi.hoisted(() => {
  const progressMock = {
    start: vi.fn(),
    advance: vi.fn(),
    message: vi.fn(),
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

const { progressMock, log, intro, outro, progress } = hoisted

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
    imports: [],
    exports: [],
  })
}

function makeFiles(count: number): KubbFile.ResolvedFile[] {
  return Array.from({ length: count }, (_, index) => makeFile(`file${index}`))
}

describe('loggerPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('lifecycle events', () => {
    it('should display intro and outro for lifecycle:start and lifecycle:end', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      await fabric.context.emit('lifecycle:start')
      expect(intro).toHaveBeenCalledWith('Fabric Starting run')

      await fabric.context.emit('lifecycle:end')
      expect(outro).toHaveBeenCalledWith('Fabric completed')
    })

    it('should log lifecycle:render event', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      await fabric.context.emit('lifecycle:render', fabric)
      expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Rendering application graph'))
    })
  })

  describe('file events', () => {
    it('should log files:added event', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      const files = makeFiles(3)
      await fabric.context.emit('files:added', files)
      expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Queued 3 files'))
    })

    it('should not log files:added when no files', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      await fabric.context.emit('files:added', [])
      expect(log.info).not.toHaveBeenCalled()
    })

    it('should log file:resolve:path event', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      const file = makeFile()
      await fabric.context.emit('file:resolve:path', file)
      expect(log.step).toHaveBeenCalledWith(expect.stringContaining('Resolving path'))
    })

    it('should log file:resolve:name event', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      const file = makeFile()
      await fabric.context.emit('file:resolve:name', file)
      expect(log.step).toHaveBeenCalledWith(expect.stringContaining('Resolving name'))
    })
  })

  describe('file processing', () => {
    it('should log files:processing:start event', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false })

      const files = makeFiles(2)
      await fabric.context.emit('files:processing:start', files)
      expect(log.step).toHaveBeenCalledWith(expect.stringContaining('Processing 2 files'))
    })

    it('should update progress bar during file:processing:update', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false, progress: true })

      const files = makeFiles(2)
      await fabric.context.emit('files:processing:start', files)

      const file = files[0]!
      await fabric.context.emit('file:processing:update', {
        processed: 1,
        total: 2,
        percentage: 50,
        file,
      })

      expect(progressMock.advance).toHaveBeenCalledWith(undefined, expect.stringContaining('Writing'))
    })

    it('should display message on file:processing:end when progress bar is active', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false, progress: true })

      const files = makeFiles(1)
      await fabric.context.emit('files:processing:start', files)

      const file = files[0]!
      await fabric.context.emit('file:processing:end', file, 0, 1)

      expect(progressMock.message).toHaveBeenCalledWith(expect.stringContaining('Finished'))
    })

    it('should stop progress bar on files:processing:end', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false, progress: true })

      const files = makeFiles(2)
      await fabric.context.emit('files:processing:start', files)
      await fabric.context.emit('files:processing:end', files)

      expect(progressMock.stop).toHaveBeenCalledWith(expect.stringContaining('Processed 2 files'))
    })

    it('should log success when progress bar is disabled', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false, progress: false })

      const files = makeFiles(2)
      await fabric.context.emit('files:processing:start', files)
      await fabric.context.emit('files:processing:end', files)

      expect(log.success).toHaveBeenCalledWith(expect.stringContaining('Processed 2 files'))
    })
  })

  describe('progress bar option', () => {
    it('should create and use progress bar when enabled', async () => {
      const fabric = createFabric()
      await fabric.use(loggerPlugin, { websocket: false, progress: true })

      const files = makeFiles(2)
      await fabric.context.emit('files:processing:start', files)

      expect(progress).toHaveBeenCalledWith({
        style: 'block',
        max: 2,
        size: 30,
      })
      expect(progressMock.start).toHaveBeenCalledWith('Processing 2 files')

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
      const file = files[0]!

      await fabric.context.emit('files:processing:start', files)
      await fabric.context.emit('file:processing:update', {
        processed: 1,
        total: 1,
        percentage: 100,
        file,
      })
      await fabric.context.emit('files:processing:end', files)

      expect(progress).not.toHaveBeenCalled()
      expect(progressMock.start).not.toHaveBeenCalled()
      expect(progressMock.advance).not.toHaveBeenCalled()
      expect(progressMock.stop).not.toHaveBeenCalled()
    })
  })
})
