import { describe, expect, test } from 'vitest'
import { Function } from './Function.ts'

describe('Function', () => {
  test('should create a basic function', () => {
    const result = Function({ name: 'myFunc', children: 'return true' })
    expect(result).toContain('function myFunc()')
    expect(result).toContain('return true')
  })

  test('should create an exported function', () => {
    const result = Function({ name: 'myFunc', export: true, children: 'return true' })
    expect(result).toContain('export function myFunc()')
  })

  test('should create a function with parameters', () => {
    const result = Function({ name: 'myFunc', params: 'a: string, b: number', children: 'return true' })
    expect(result).toContain('function myFunc(a: string, b: number)')
  })

  test('should create an async function', () => {
    const result = Function({ name: 'myFunc', async: true, children: 'return true' })
    expect(result).toContain('async function myFunc()')
  })

  test('should create a function with generics', () => {
    const result = Function({ name: 'myFunc', generics: 'T', children: 'return true' })
    expect(result).toContain('function myFunc<T>()')
  })

  test('should create a function with return type', () => {
    const result = Function({ name: 'myFunc', returnType: 'boolean', children: 'return true' })
    expect(result).toContain('function myFunc(): boolean')
  })

  test('should create an async function with Promise return type', () => {
    const result = Function({ name: 'myFunc', async: true, returnType: 'boolean', children: 'return true' })
    expect(result).toContain('async function myFunc(): Promise<boolean>')
  })
})

describe('Function.Arrow', () => {
  test('should create a basic arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', children: 'return true' })
    expect(result).toContain('const myFunc =')
    expect(result).toContain('=>')
  })

  test('should create a single line arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', singleLine: true, children: 'true' })
    expect(result).toContain('const myFunc = () => true')
  })
})
