import { describe, expect, test, vi } from 'vitest'

import { createParser } from './createParser.ts'

describe('createParser', () => {
  test('returns a parser object with type and provided properties', async () => {
    const install = vi.fn()
    const print = vi.fn().mockResolvedValue('printed')

    const userParser = {
      name: 'testParser',
      install,
      print,
    }

    const parser = createParser(userParser)

    expect(parser.type).toBe('parser')
    expect(parser.name).toBe('testParser')
    expect(parser.install).toBe(install)

    const result = await parser.print({} as any, {})
    expect(print).toHaveBeenCalledTimes(1)
    expect(result).toBe('printed')
  })
})
