import { describe, expect, it } from 'vitest'
import { code, stc, template } from './stc.ts'

describe('stc', () => {
  it('should create a string template component', async () => {
    function HelloWorld(props: { name: string }) {
      return `Hello, ${props.name}!`
    }

    const HelloWorldStc = stc(HelloWorld)
    const result = await HelloWorldStc({ name: 'World' })

    expect(result).toBe('Hello, World!')
  })

  it('should handle async components', async () => {
    async function AsyncComponent(props: { value: number }) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return `Value: ${props.value}`
    }

    const Component = stc(AsyncComponent)
    const result = await Component({ value: 42 })

    expect(result).toBe('Value: 42')
  })

  it('should work without props', async () => {
    function SimpleComponent() {
      return 'Simple output'
    }

    const Component = stc(SimpleComponent)
    const result = await Component({})

    expect(result).toBe('Simple output')
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
