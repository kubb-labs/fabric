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

  it('should handle object mode with all optional params (realistic hook example)', () => {
    // Realistic case: React Query hook with all optional parameters
    const hookParams = {
      options: {
        children: {
          pathParams: { type: 'PathParams', optional: true },
          data: { type: 'Data', optional: true },
          params: { type: 'Params', optional: true },
          headers: { type: 'Headers', optional: true },
        },
      },
    }

    const result = getFunctionParams(hookParams, { type: 'constructor' })
    // All children are optional, so parent should have = {} at the end
    expect(result).toBe('{ pathParams, data, params, headers }: { pathParams?: PathParams; data?: Data; params?: Params; headers?: Headers } = {}')
  })

  it('should NOT add = {} when children are mixed required/optional', () => {
    const mixedParams = {
      options: {
        children: {
          required: { type: 'string', optional: false },
          optional: { type: 'number', optional: true },
        },
      },
    }

    const result = getFunctionParams(mixedParams, { type: 'constructor' })
    // Should NOT have = {} because not all children are optional
    expect(result).toBe('{ required, optional }: { required: string; optional?: number }')
    expect(result).not.toContain(' = {}')
  })

  it('should add = {} when parent has explicit type and all children optional', () => {
    const paramsWithType = {
      options: {
        type: 'RequestOptions',
        children: {
          pathParams: { type: 'PathParams', optional: true },
          data: { type: 'Data', optional: true },
        },
      },
    }

    const result = getFunctionParams(paramsWithType, { type: 'constructor' })
    // When parent has explicit type and all children are optional, it should still add = {}
    // This makes the entire parameter optional, allowing function calls without it
    expect(result).toBe('{ pathParams, data }: RequestOptions = {}')
  })
})

  it('should treat children with default values as optional for parent optionality', () => {
    const paramsWithChildDefaults = {
      options: {
        children: {
          name: { type: 'string', default: "'John'" },
          age: { type: 'number', default: '30' },
        },
      },
    }

    const result = getFunctionParams(paramsWithChildDefaults, { type: 'constructor' })
    // All children have defaults, so parent should be treated as optional (has = {})
    // But the types themselves don't need ? since they have defaults
    expect(result).toBe("{ name = 'John', age = 30 }: { name: string; age: number } = {}")
  })
