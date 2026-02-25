import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createReactFabric } from './createReactFabric.ts'

const hoisted = vi.hoisted(() => {
  const instance = {
    render: vi.fn(),
    renderToString: vi.fn().mockResolvedValue('hello'),
    waitUntilExit: vi.fn().mockResolvedValue(undefined),
    unmount: vi.fn(),
  }
  return { instance }
})

vi.mock('./Runtime.tsx', () => {
  class RuntimeMock {
    render = hoisted.instance.render
    renderToString = hoisted.instance.renderToString
    waitUntilExit = hoisted.instance.waitUntilExit
    unmount = hoisted.instance.unmount
  }
  return { Runtime: RuntimeMock }
})

const Component = () => 'test'

describe('e2e', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should delegate rendering to Runtime.render', async () => {
    const fabric = createReactFabric()

    await fabric.render(<Component />)

    expect(hoisted.instance.render).toHaveBeenCalledTimes(1)
  })

  it('should return runtime result from renderToString', async () => {
    const fabric = createReactFabric()

    await expect(fabric.renderToString(<Component />)).resolves.toBe('hello')
    expect(hoisted.instance.renderToString).toHaveBeenCalledTimes(1)
  })

  it('should delegate waitUntilExit to runtime', async () => {
    const fabric = createReactFabric()

    await fabric.waitUntilExit()
    expect(hoisted.instance.waitUntilExit).toHaveBeenCalledTimes(1)
  })

  describe('unmount', () => {
    it('should delegate unmount to runtime', () => {
      const fabric = createReactFabric()

      fabric.unmount()

      expect(hoisted.instance.unmount).toHaveBeenCalledTimes(1)
      expect(hoisted.instance.unmount).toHaveBeenCalledWith(undefined)
    })

    it('should forward error argument to runtime.unmount', () => {
      const fabric = createReactFabric()
      const err = new Error('test error')

      fabric.unmount(err)

      expect(hoisted.instance.unmount).toHaveBeenCalledWith(err)
    })

    it('should remove all event listeners on unmount', () => {
      const fabric = createReactFabric()
      const handler = vi.fn()

      fabric.context.on('lifecycle:start', handler)
      fabric.unmount()

      fabric.context.emit('lifecycle:start')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should not increase process listener count after unmount', () => {
      const before = process.listenerCount('SIGINT')
      const fabric = createReactFabric()

      // Runtime is mocked, so we check the base fabric cleanup
      fabric.unmount()

      expect(process.listenerCount('SIGINT')).toBe(before)
    })
  })
})
