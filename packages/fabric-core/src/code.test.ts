import { describe, expect, it } from 'vitest'

import { code } from './code.ts'
import { br, dedent, indent } from './intrinsic.ts'

describe('code', () => {
  it('should create a code template string', () => {
    const name = 'myVar'
    const value = 42

    const result = code`const ${name} = ${value};`

    expect(result).toBe('const myVar = 42;')
  })

  it('should handle multiline code', () => {
    const name = 'myFunction'

    const result = code`
      function ${name}() {
        return true;
      }
    `

    expect(result).toContain('function myFunction()')
    expect(result).toContain('return true;')
  })

  it('should handle array values', () => {
    const items = ['a', 'b', 'c']
    const result = code`Items: ${items}`

    expect(result).toBe('Items: abc')
  })

  it('should handle null and undefined', () => {
    const result = code`Value: ${null}, ${undefined}`

    expect(result).toBe('Value: ,')
  })

  it('should generate TypeScript code', () => {
    const interfaceName = 'User'
    const field1 = 'name'
    const field2 = 'age'

    const result = code`
interface ${interfaceName} {
  ${field1}: string;
  ${field2}: number;
}
    `.trim()

    expect(result).toContain('interface User')
    expect(result).toContain('name: string')
    expect(result).toContain('age: number')
  })

  it('should return functions with indentation and line breaks', () => {
    const name = 'myFunction'
    const result = code`function ${name}() {${indent}${br}console.log("Hello");${dedent}${br}}`

    expect(result).toMatchInlineSnapshot(`
      "function myFunction() {
        console.log("Hello");
      }"
    `)
  })
})
