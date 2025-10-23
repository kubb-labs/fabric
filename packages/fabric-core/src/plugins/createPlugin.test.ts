import { describe, expect, test, vi } from 'vitest'

import { createPlugin } from './createPlugin.ts'

describe('createPlugin', () => {
  test('returns a plugin object with type and provided properties', () => {
    const install = vi.fn()

    const userPlugin = {
      name: 'testPlugin',
      install,
    }

    const plugin = createPlugin(userPlugin)

    expect(plugin.type).toBe('plugin')
    expect(plugin.name).toBe('testPlugin')
    expect(plugin.install).toBe(install)
  })
})
