import { describe, expect, test } from 'vitest'
import { Type } from './Type.ts'

describe('Type', () => {
  test('should create a basic type', () => {
    const result = Type({ name: 'MyType', children: '{ a: string }' })
    expect(result).toBe('type MyType = { a: string }')
  })

  test('should create an exported type', () => {
    const result = Type({ name: 'MyType', export: true, children: '{ a: string }' })
    expect(result).toBe('export type MyType = { a: string }')
  })

  test('should throw error if name does not start with capital letter', () => {
    expect(() => {
      Type({ name: 'myType', children: 'string' })
    }).toThrow('Name should start with a capital letter')
  })

  test('should create a type with JSDoc', () => {
    const result = Type({ 
      name: 'MyType', 
      JSDoc: { comments: ['This is a type'] }, 
      children: 'string' 
    })
    expect(result).toContain('/** This is a type */')
    expect(result).toContain('type MyType = string')
  })
})
