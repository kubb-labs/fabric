import { beforeEach, describe, expect, test, vi } from 'vitest'

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

  test('render delegates to Runtime.render', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)

    expect(hoisted.instance.render).toHaveBeenCalledTimes(1)
  })

  test('renderToString returns runtime result', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await expect(fabric.renderToString(Component)).resolves.toBe('hello')
    expect(hoisted.instance.renderToString).toHaveBeenCalledTimes(1)
  })

  test('waitUntilExit delegated from runtime', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.waitUntilExit()
    expect(hoisted.instance.waitUntilExit).toHaveBeenCalledTimes(1)
  })
})
