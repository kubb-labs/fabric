import { describe, expect, it, test } from 'vitest'
import { mockParams } from '../../mocks/mockParams.ts'
import { getFunctionParams } from './getFunctionParams.ts'

describe('[params] getFunctionParams call(Function.Call)', () => {
  test.each(mockParams)('$name', async ({ params }) => {
    expect(getFunctionParams(params, { type: 'call' })).toMatchSnapshot()
  })
})

describe('[params] getFunctionParams constructor (Function)', () => {
  test.each(mockParams)('$name', async ({ params }) => {
    expect(getFunctionParams(params, { type: 'constructor' })).toMatchSnapshot()
  })
})

describe('[params] getFunctionParams object', () => {
  test.each(mockParams)('$name', async ({ params }) => {
    expect(getFunctionParams(params, { type: 'object' })).toMatchSnapshot()
  })
})

describe('[params] getFunctionParams objectValue', () => {
  test.each(mockParams)('$name', async ({ params }) => {
    expect(getFunctionParams(params, { type: 'objectValue' })).toMatchSnapshot()
  })
})

describe('[params] getFunctionParams with transformers', () => {
  it('should transform names in constructor mode', () => {
    const params = {
      test: { type: 'string', optional: false },
      count: { type: 'number', optional: true },
    }

    const result = getFunctionParams(params, {
      type: 'constructor',
      transformName: (name) => name.toUpperCase(),
      transformType: (type) => `Custom${type.charAt(0).toUpperCase()}${type.slice(1)}`,
    })

    expect(result).toContain('TEST')
    expect(result).toContain('COUNT')
  })

  it('should handle empty params', () => {
    const result = getFunctionParams({}, { type: 'call' })
    expect(result).toBe('')
  })

  it('should handle nested params', () => {
    const params = {
      parent: {
        type: 'object',
        children: {
          child1: { type: 'string' },
          child2: { type: 'number' },
        },
      },
    }

    const result = getFunctionParams(params, { type: 'object' })
    expect(result).toBeDefined()
    expect(result).toContain('child1')
    expect(result).toContain('child2')
  })
})

describe('[params] getFunctionParams callback (Function.Callback)', () => {
  test.each(mockParams)('$name', async ({ params }) => {
    expect(getFunctionParams(params, { type: 'callback' })).toMatchSnapshot()
  })
})