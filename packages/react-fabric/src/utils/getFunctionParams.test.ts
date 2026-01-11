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

  it('should render optional object mode params with = {} syntax', () => {
    // Object mode with all optional children
    const paramsObjectMode = {
      data: {
        children: {
          name: { type: 'string' as const, optional: true },
          age: { type: 'number' as const, optional: true },
        },
      },
    }

    const resultObjectMode = getFunctionParams(paramsObjectMode, { type: 'constructor' })
    // Should use ": type = {}" syntax for optional destructured params
    expect(resultObjectMode).toBe('{ name, age }: { name?: string; age?: number } = {}')
    // Should NOT use invalid "?: type" syntax
    expect(resultObjectMode).not.toContain('}?:')
  })

  it('should render optional inline mode params with ?: syntax', () => {
    // Inline mode with all optional children
    const paramsInlineMode = {
      data: {
        mode: 'inline' as const,
        children: {
          name: { type: 'string' as const, optional: true },
          age: { type: 'number' as const, optional: true },
        },
      },
    }

    const resultInlineMode = getFunctionParams(paramsInlineMode, { type: 'constructor' })
    // Should use "?: type" syntax for inline params
    expect(resultInlineMode).toBe('data?: { name?: string; age?: number }')
  })

  it('should handle explicitly set optional flag on object mode parent', () => {
    const params = {
      data: {
        optional: true,  // Explicitly setting optional on the parent
        children: {
          name: { type: 'string' as const },  // Children are NOT optional
          age: { type: 'number' as const },
        },
      },
    }

    const result = getFunctionParams(params, { type: 'constructor' })
    // When optional is explicitly set on parent, it should make the whole parameter optional
    expect(result).toBe('{ name, age }: { name: string; age: number } = {}')
  })

  it('should handle explicitly set optional flag on inline mode parent', () => {
    const params = {
      data: {
        mode: 'inline' as const,
        optional: true,  // Explicitly setting optional on the parent
        children: {
          name: { type: 'string' as const },  // Children are NOT optional
          age: { type: 'number' as const },
        },
      },
    }

    const result = getFunctionParams(params, { type: 'constructor' })
    // When optional is explicitly set on parent in inline mode, it should use ?: syntax
    expect(result).toBe('data?: { name: string; age: number }')
  })
})
