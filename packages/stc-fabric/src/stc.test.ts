import { describe, expect, it } from 'vitest'
import { code, stc, template, text } from './stc.ts'

describe('stc', () => {
  it('should create a string template component', () => {
    function HelloWorld(props: { name: string }) {
      return `Hello, ${props.name}!`
    }

    const HelloWorldStc = stc(HelloWorld)
    const result = HelloWorldStc({ name: 'World' })()

    expect(result).toBe('Hello, World!')
  })

  it('should work without props', () => {
    function SimpleComponent() {
      return 'Simple output'
    }

    const Component = stc(SimpleComponent)
    const result = Component()()

    expect(result).toBe('Simple output')
  })

  it('should work with complex components', () => {
    function ComplexComponent(props: { items: string[] }) {
      return props.items.map((item) => `- ${item}`).join('\n')
    }

    const Component = stc(ComplexComponent)
    const result = Component({ items: ['one', 'two', 'three'] })()

    expect(result).toBe('- one\n- two\n- three')
  })

  it('should support .code() method for template children', () => {
    function Component(props: { children?: string }) {
      return props.children || 'default'
    }

    const Stc = stc(Component)
    const result = Stc().code`const x = 1;`()

    expect(result).toBe('const x = 1;')
  })

  it('should support .text() method for text children', () => {
    function Component(props: { children?: string }) {
      return props.children || 'default'
    }

    const Stc = stc(Component)
    const result = Stc().text`Hello World`()

    expect(result).toBe('Hello World')
  })

  it('should support .children() method for array children', () => {
    function Component(props: { children?: any }) {
      if (Array.isArray(props.children)) {
        return props.children.join(', ')
      }
      return props.children || 'default'
    }

    const Stc = stc(Component)
    const result = Stc().children('a', 'b', 'c')()

    expect(result).toBe('a, b, c')
  })

  it('should work with props and code method', () => {
    function Component(props: { name: string; children?: string }) {
      return `${props.name}: ${props.children || 'none'}`
    }

    const Stc = stc(Component)
    const result = Stc({ name: 'Test' }).code`const value = 42;`()

    expect(result).toBe('Test: const value = 42;')
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

  it('should handle array values', () => {
    const items = ['a', 'b', 'c']
    const result = template`Items: ${items}`

    expect(result).toBe('Items: abc')
  })

  it('should handle null and undefined', () => {
    const result = template`Value: ${null}, ${undefined}`

    expect(result).toBe('Value: , ')
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

describe('text', () => {
  it('should be an alias for template', () => {
    const value = 'hello'
    const result = text`Text: ${value}`

    expect(result).toBe('Text: hello')
  })
})
