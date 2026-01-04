import { describe, expect, it } from 'vitest'
import { code, createContext, fsx, useContext } from './index.ts'

describe('fsx e2e integration', () => {
  it('should work with createFabric', () => {
    // Example 1: Basic fsx component
    function HelloWorld(props: { name: string }) {
      return code`
        // Generated greeting
        const greeting = "Hello, ${props.name}!";
      `
    }

    const HelloWorldStc = fsx(HelloWorld)
    const greeting = HelloWorldStc({ name: 'World' })

    expect(greeting).toContain('Hello, World!')
  })

  it('should use context in components', () => {
    const ConfigContext = createContext({
      prefix: 'generated',
      suffix: 'Impl',
    })

    function ClassGenerator(props: { name: string; methods: string[] }) {
      const config = useContext<{ prefix: string; suffix: string }>(ConfigContext)
      const className = `${config.prefix}${props.name}${config.suffix}`

      const methodsCode = props.methods.map((method) => `  ${method}() {\n    // TODO: implement\n  }`).join('\n\n')

      return code`
export class ${className} {
${methodsCode}
}
      `
    }

    const ClassGeneratorStc = fsx(ClassGenerator)

    const userClass = ClassGeneratorStc({
      name: 'User',
      methods: ['getName', 'setName', 'getAge', 'setAge'],
    })

    expect(userClass).toContain('export class generatedUserImpl')
    expect(userClass).toContain('getName()')
    expect(userClass).toContain('setName()')
  })

  it('should compose multiple fsx components', () => {
    function HelloWorld(props: { name: string }) {
      return code`
        // Generated greeting
        const greeting = "Hello, ${props.name}!";
      `
    }

    function ClassGenerator(props: { name: string }) {
      return code`
export class ${props.name} {
  constructor() {}
}
      `
    }

    const HelloWorldStc = fsx(HelloWorld)
    const ClassGeneratorStc = fsx(ClassGenerator)

    const greeting = HelloWorldStc({ name: 'World' })
    const userClass = ClassGeneratorStc({ name: 'User' })

    const final = code`
${greeting}

${userClass}
    `.trim()

    expect(final).toContain('Hello, World!')
    expect(final).toContain('export class User')
  })

  it('should integrate with Fabric file generation', () => {
    function CodeGenerator(props: { className: string }) {
      return code`
export class ${props.className} {
  constructor() {
    // Generated class
  }
}
      `
    }

    const Generator = fsx(CodeGenerator)
    const generatedCode = Generator({ className: 'MyClass' })

    expect(generatedCode).toContain('export class MyClass')
    expect(generatedCode).toContain('constructor()')
  })
})
