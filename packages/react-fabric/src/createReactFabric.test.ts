import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createReactFabric } from './createReactFabric.ts'

const hoisted = vi.hoisted(() => {
  const instance = {
    render: vi.fn(),
    renderToString: vi.fn().mockResolvedValue('hello'),
    waitUntilExit: vi.fn().mockResolvedValue(undefined),
  }
  return { instance }
})

vi.mock('./Runtime.tsx', () => {
  class RuntimeMock {
    render = hoisted.instance.render
    renderToString = hoisted.instance.renderToString
    waitUntilExit = hoisted.instance.waitUntilExit
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

    await fabric.render(Component)

    expect(hoisted.instance.render).toHaveBeenCalledTimes(1)
  })

  it('should return runtime result from renderToString', async () => {
    const fabric = createReactFabric()

    await expect(fabric.renderToString(Component)).resolves.toBe('hello')
    expect(hoisted.instance.renderToString).toHaveBeenCalledTimes(1)
  })

  it('should delegate waitUntilExit to runtime', async () => {
    const fabric = createReactFabric()

    await fabric.waitUntilExit()
    expect(hoisted.instance.waitUntilExit).toHaveBeenCalledTimes(1)
  })
})
