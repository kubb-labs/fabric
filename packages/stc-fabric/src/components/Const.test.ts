import { describe, expect, test } from 'vitest'
import { Const } from './Const.ts'

describe('Const', () => {
  test('should create a basic const', () => {
    const result = Const({ name: 'myVar', children: '"hello"' })
    expect(result).toBe('const myVar = "hello"')
  })

  test('should create an exported const', () => {
    const result = Const({ name: 'myVar', export: true, children: '"hello"' })
    expect(result).toBe('export const myVar = "hello"')
  })

  test('should create a typed const', () => {
    const result = Const({ name: 'myVar', type: 'string', children: '"hello"' })
    expect(result).toBe('const myVar: string = "hello"')
  })

  test('should create a const with as const', () => {
    const result = Const({ name: 'myVar', asConst: true, children: '{ a: 1 }' })
    expect(result).toBe('const myVar = { a: 1 } as const')
  })

  test('should create a const with JSDoc', () => {
    const result = Const({ 
      name: 'myVar', 
      JSDoc: { comments: ['This is a variable'] }, 
      children: '"hello"' 
    })
    expect(result).toContain('/** This is a variable */')
    expect(result).toContain('const myVar = "hello"')
  })
})
