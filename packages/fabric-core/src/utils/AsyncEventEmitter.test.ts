import { describe, expect, it, vi } from 'vitest'
import { AsyncEventEmitter } from './AsyncEventEmitter.ts'

type Events = {
  test: []
}

describe('AsyncEventEmitter', () => {
  it('should return undefined when no listeners are registered', async () => {
    const emitter = new AsyncEventEmitter<Events>()

    await expect(emitter.emit('test')).resolves.toBeUndefined()
  })

  it('resolves when listeners succeed', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    const spy = vi.fn()

    emitter.on('test', async () => {
      spy()
    })

    await expect(emitter.emit('test')).resolves.toBeUndefined()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('rethrows single listener error', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    emitter.on('test', async () => {
      throw new Error('boom')
    })

    await expect(emitter.emit('test')).rejects.toThrow('boom')
  })

  it('aggregates multiple listener errors', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    emitter.on('test', async () => {
      throw new Error('first')
    })
    emitter.on('test', async () => {
      throw new Error('second')
    })

    await expect(emitter.emit('test')).rejects.toBeInstanceOf(AggregateError)
    await expect(emitter.emit('test')).rejects.toThrow('Errors in async listeners for "test"')
  })

  it('should handle parallel mode execution', async () => {
    const emitter = new AsyncEventEmitter<Events>({ mode: 'parallel' })
    const spy = vi.fn()

    emitter.on('test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      spy(1)
    })
    emitter.on('test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      spy(2)
    })

    await emitter.emit('test')

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(1)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('should handle parallel mode with errors', async () => {
    const emitter = new AsyncEventEmitter<Events>({ mode: 'parallel' })

    emitter.on('test', async () => {
      throw new Error('parallel error 1')
    })
    emitter.on('test', async () => {
      throw new Error('parallel error 2')
    })

    await expect(emitter.emit('test')).rejects.toBeInstanceOf(AggregateError)
  })

  it('should remove listener with off', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    const spy = vi.fn()
    const handler = async () => spy()

    emitter.on('test', handler)
    await emitter.emit('test')
    expect(spy).toHaveBeenCalledTimes(1)

    emitter.off('test', handler)
    await emitter.emit('test')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should fire onOnce handler only once', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    const spy = vi.fn()

    emitter.onOnce('test', async () => spy())

    await emitter.emit('test')
    await emitter.emit('test')
    await emitter.emit('test')

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should remove all listeners with removeAll', async () => {
    const emitter = new AsyncEventEmitter<Events>()
    const spy = vi.fn()

    emitter.on('test', async () => spy())
    emitter.on('test', async () => spy())

    await emitter.emit('test')
    expect(spy).toHaveBeenCalledTimes(2)

    emitter.removeAll()

    await emitter.emit('test')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should handle custom maxListener setting', () => {
    const emitter = new AsyncEventEmitter<Events>({ maxListener: 50 })
    expect(emitter).toBeDefined()
  })
})
