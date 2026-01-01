import { describe, expect, it } from 'vitest'
import { code, createContext, createReference, createSignal, h, inject, ref, stc, useContext } from './index.ts'

describe('stc integration', () => {
  it('should integrate stc with context', () => {
    const ThemeContext = createContext({ color: 'blue' })

    function Component(props: { name: string }) {
      const theme = useContext(ThemeContext)
      return code`const ${props.name} = "${theme.color}";`
    }

    const MyComponent = stc(Component)
    const result = MyComponent({ name: 'myVar' })

    expect(result).toContain('const myVar = "blue";')
  })

  it('should integrate stc with references', () => {
    const reference = createReference('myVar', 42)

    function Component() {
      return code`const value = ${reference.value};`
    }

    const MyComponent = stc(Component)
    const result = MyComponent({})

    expect(result).toContain('const value = 42;')
  })

  it('should integrate stc with signals', () => {
    const count = createSignal(0)

    function Component() {
      count.value += 1
      return code`const counter = ${count.value};`
    }

    const MyComponent = stc(Component)
    
    const result1 = MyComponent({})
    expect(result1).toContain('const counter = 1;')
    
    const result2 = MyComponent({})
    expect(result2).toContain('const counter = 2;')
  })

  it('should compose multiple stc components', () => {
    function Header() {
      return code`// Auto-generated file`
    }

    function Body(props: { content: string }) {
      return code`export const data = "${props.content}";`
    }

    const HeaderStc = stc(Header)
    const BodyStc = stc(Body)

    const header = HeaderStc({})
    const body = BodyStc({ content: 'test' })

    const final = code`
${header}

${body}
    `.trim()

    expect(final).toContain('// Auto-generated file')
    expect(final).toContain('export const data = "test";')
  })

  it('should handle complex TypeScript code generation', () => {
    function InterfaceGenerator(props: { name: string; fields: Array<{ name: string; type: string }> }) {
      const fieldsCode = props.fields
        .map(field => `  ${field.name}: ${field.type};`)
        .join('\n')

      return code`
interface ${props.name} {
${fieldsCode}
}
      `.trim()
    }

    const Generator = stc(InterfaceGenerator)
    const result = Generator({
      name: 'User',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
      ],
    })

    expect(result).toContain('interface User')
    expect(result).toContain('id: number;')
    expect(result).toContain('name: string;')
    expect(result).toContain('email: string;')
  })
})

describe('Vue-style API integration', () => {
  it('should work with ref (Vue-style)', () => {
    const count = ref(0)

    function Component() {
      count.value += 1
      return code`const counter = ${count.value};`
    }

    const MyComponent = h(Component)
    
    const result1 = MyComponent({})
    expect(result1).toContain('const counter = 1;')
    
    const result2 = MyComponent({})
    expect(result2).toContain('const counter = 2;')
  })

  it('should work with inject (Vue-style)', () => {
    const ConfigContext = createContext({ prefix: 'app' })

    function Component(props: { name: string }) {
      const config = inject(ConfigContext)
      return code`const ${config.prefix}_${props.name} = true;`
    }

    const MyComponent = h(Component)
    const result = MyComponent({ name: 'flag' })

    expect(result).toContain('const app_flag = true;')
  })

  it('should work with h() as alias for stc()', () => {
    function SimpleComponent(props: { text: string }) {
      return code`// ${props.text}`
    }

    const Component1 = h(SimpleComponent)
    const Component2 = stc(SimpleComponent)

    const result1 = Component1({ text: 'test' })
    const result2 = Component2({ text: 'test' })

    expect(result1).toBe(result2)
    expect(result1).toContain('// test')
  })
})
