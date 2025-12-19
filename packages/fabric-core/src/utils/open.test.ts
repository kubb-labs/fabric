import { describe, expect, it, vi } from 'vitest'
import { open } from './open.ts'

// Mock child_process spawn
vi.mock('node:child_process', () => ({
  spawn: vi.fn((_bin, _args, _options) => {
    const EventEmitter = require('node:events')
    const process = new EventEmitter()
    
    // Simulate successful process completion
    setTimeout(() => {
      process.emit('close', 0)
    }, 10)
    
    return process
  }),
}))

describe('open utility', () => {
  const originalPlatform = process.platform

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })

  it('should open on Windows platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })

    const result = await open('/path/to/file.html')
    expect(result).toBe(true)
  })

  it('should open with app on Windows platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })

    const result = await open('/path/to/file.html', { app: 'chrome' })
    expect(result).toBe(true)
  })

  it('should open on Linux platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })

    const result = await open('/path/to/file.html')
    expect(result).toBe(true)
  })

  it('should open with app on Linux platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })

    const result = await open('/path/to/file.html', { app: 'firefox' })
    expect(result).toBe(true)
  })

  it('should open on macOS platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    })

    const result = await open('/path/to/file.html')
    expect(result).toBe(true)
  })

  it('should open with app on macOS platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    })

    const result = await open('/path/to/file.html', { app: 'Safari' })
    expect(result).toBe(true)
  })

  it('should throw error for unsupported platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'unknown',
      configurable: true,
    })

    await expect(open('/path/to/file.html')).rejects.toThrow('Unsupported platform')
  })

  it('should handle process failure', async () => {
    const { spawn } = await import('node:child_process')
    const EventEmitter = require('node:events')
    
    vi.mocked(spawn).mockImplementationOnce(() => {
      const childProcess = new EventEmitter()
      
      setTimeout(() => {
        childProcess.emit('close', 1) // non-zero exit code
      }, 10)
      
      return childProcess as ReturnType<typeof spawn>
    })

    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })

    const result = await open('/path/to/file.html')
    expect(result).toBe(false)
  })
})
