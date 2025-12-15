import { describe, expect, test, vi } from 'vitest'

import { defineParser } from './defineParser.ts'

describe('defineParser', () => {
  test('returns a parser object with type and provided properties', async () => {
    const install = vi.fn()
    const parse = vi.fn().mockResolvedValue('printed')

    const parser = defineParser({
      name: 'testParser',
      extNames: ['.ts'],
      install,
      parse,
    })

    expect(parser.type).toBe('parser')
    expect(parser.name).toBe('testParser')
    expect(parser.install).toBe(install)

    const result = await parser.parse({} as any, {})
    expect(parse).toHaveBeenCalledTimes(1)
    expect(result).toBe('printed')
  })
})
