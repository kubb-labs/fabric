import { describe, expect, it } from 'vitest'
import { code, stc, template } from './stc.ts'

describe('stc', () => {
  it('should create a string template component', () => {
    function HelloWorld(props: { name: string }) {
      return `Hello, ${props.name}!`
    }

    const HelloWorldStc = stc(HelloWorld)
    const result = HelloWorldStc({ name: 'World' })

    expect(result).toBe('Hello, World!')
  })

  it('should work without props', () => {
    function SimpleComponent() {
      return 'Simple output'
    }

    const Component = stc(SimpleComponent)
    const result = Component({})

    expect(result).toBe('Simple output')
  })

  it('should work with complex components', () => {
    function ComplexComponent(props: { items: string[] }) {
      return props.items.map((item) => `- ${item}`).join('\n')
    }

    const Component = stc(ComplexComponent)
    const result = Component({ items: ['one', 'two', 'three'] })

    expect(result).toBe('- one\n- two\n- three')
  })
})

describe('template', () => {
  it('should create a template string', () => {
    const name = 'myVar'
    const value = 42

    const result = template`const ${name} = ${value};`

    expect(result).toBe('const myVar = 42;')
  })

  it('should handle multiline templates', () => {
    const name = 'myFunction'

    const result = template`
      function ${name}() {
        return true;
      }
    `

    expect(result).toContain('function myFunction()')
    expect(result).toContain('return true;')
  })
})

describe('code', () => {
  it('should be an alias for template', () => {
    const name = 'test'
    const result = code`const ${name} = 1;`

    expect(result).toBe('const test = 1;')
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
})
