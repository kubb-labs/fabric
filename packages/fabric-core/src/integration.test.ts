import { describe, expect, it } from 'vitest'
import { code, createContext, inject, provide, fsx, unprovide, useContext } from './index.ts'

describe('fsx integration', () => {
  it('should integrate fsx with context', () => {
    const ThemeContext = createContext({ color: 'blue' })

    function Component(props: { name: string }) {
      const theme = useContext<{ color: string }>(ThemeContext)
      return code`const ${props.name} = "${theme.color}";`
    }

    const MyComponent = fsx(Component)
    const result = MyComponent({ name: 'myVar' })

    expect(result).toContain('const myVar = "blue";')
  })

  it('should compose multiple fsx components', () => {
    function Header() {
      return code`// Auto-generated file`
    }

    function Body(props: { content: string }) {
      return code`export const data = "${props.content}";`
    }

    const HeaderStc = fsx(Header)
    const BodyStc = fsx(Body)

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
      const fieldsCode = props.fields.map((field) => `  ${field.name}: ${field.type};`).join('\n')

      return code`
interface ${props.name} {
${fieldsCode}
}
      `.trim()
    }

    const Generator = fsx(InterfaceGenerator)
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
  it('should work with provide/inject (Vue 3 style)', () => {
    const ConfigKey = Symbol('config')

    function Component(props: { name: string }) {
      const config = inject(ConfigKey, { prefix: 'default' })
      return code`const ${config.prefix}_${props.name} = true;`
    }

    const MyComponent = fsx(Component)

    provide(ConfigKey, { prefix: 'app' })
    const result = MyComponent({ name: 'flag' })
    unprovide(ConfigKey)

    expect(result).toContain('const app_flag = true;')
  })

  it('should work with createContext and useContext (React-style)', () => {
    const ConfigContext = createContext({ prefix: 'react' })

    function Component(props: { name: string }) {
      const config = useContext<{ prefix: string }>(ConfigContext)
      return code`const ${config.prefix}_${props.name} = true;`
    }

    const MyComponent = fsx(Component)

    provide(ConfigContext, { prefix: 'custom' })
    const result = MyComponent({ name: 'value' })
    unprovide(ConfigContext)

    expect(result).toContain('const custom_value = true;')
  })
})
