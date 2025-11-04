import { describe, expect, it, vi } from 'vitest'
import { AsyncEventEmitter } from './AsyncEventEmitter.ts'

type Events = {
  test: []
}

describe('AsyncEventEmitter', () => {
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
})
