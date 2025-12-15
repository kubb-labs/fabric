import { describe, expect, test, vi } from 'vitest'

import { definePlugin } from './definePlugin.ts'

describe('definePlugin', () => {
  test('returns a plugin object with type and provided properties', () => {
    const install = vi.fn()

    const userPlugin = {
      name: 'testPlugin',
      install,
    }

    const plugin = definePlugin(userPlugin)

    expect(plugin.type).toBe('plugin')
    expect(plugin.name).toBe('testPlugin')
    expect(plugin.install).toBe(install)
  })
})
