import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from './plugins/reactPlugin.ts'

const Component = () => 'test'

describe('e2e', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should delegate rendering to Runtime.render', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)

    expect(hoisted.instance.render).toHaveBeenCalledTimes(1)
  })

  it('should return runtime result from renderToString', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await expect(fabric.renderToString(Component)).resolves.toBe('hello')
    expect(hoisted.instance.renderToString).toHaveBeenCalledTimes(1)
  })

  it('should delegate waitUntilExit to runtime', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.waitUntilExit()
    expect(hoisted.instance.waitUntilExit).toHaveBeenCalledTimes(1)
  })
})
