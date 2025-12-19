import { describe, expect, it, vi } from 'vitest'

import { definePlugin } from './definePlugin.ts'

describe('definePlugin', () => {
  it('should return a plugin object with type and provided properties', () => {
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
