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

  test('should create a function with JSDoc', () => {
    const result = Function({ name: 'myFunc', JSDoc: { comments: ['@deprecated'] }, children: 'return true' })
    expect(result).toContain('@deprecated')
    expect(result).toContain('function myFunc()')
  })

  test('should create a default exported function', () => {
    const result = Function({ name: 'myFunc', export: true, default: true, children: 'return true' })
    expect(result).toContain('export default function myFunc()')
  })

  test('should create a function with multiple parameters', () => {
    const result = Function({ name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' })
    expect(result).toContain('function getData<TData>(): number')
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

  test('should create an exported arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', export: true, children: 'return true' })
    expect(result).toContain('export const myFunc =')
  })

  test('should create an async arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', async: true, children: 'return true' })
    expect(result).toContain('async')
  })

  test('should create an arrow function with generics', () => {
    const result = Function.Arrow({ name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' })
    expect(result).toContain('<TData>')
    expect(result).toContain(': number')
  })

  test('should create a default exported arrow function', () => {
    const result = Function.Arrow({ name: 'myFunc', export: true, default: true, children: 'return true' })
    expect(result).toContain('export default')
  })
})
