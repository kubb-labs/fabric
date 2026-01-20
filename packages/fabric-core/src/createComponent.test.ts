import { describe, expect, it } from 'vitest'
import { createComponent } from './createComponent.ts'
import type { FabricNode } from './Fabric.ts'

describe('createComponent', () => {
  it('should create a component builder', () => {
    const builder = createComponent('MyComponent', ({ name }: { name: string }) => `Hello ${name}`)

    expect(builder).toBeDefined()
  })

  it('should allow calling the builder with props', () => {
    const component = ({ name }: { name: string }) => `Hello ${name}`
    const builder = createComponent('MyComponent', component)
    const element = builder({ name: 'World' })

    expect(element.props).toEqual({ name: 'World' })
    expect(element.component).toBe(component)

    // Element is also a function that executes the component
    expect(element()).toBe('Hello World')
  })

  it('should allow adding children', () => {
    const builder = createComponent('MyComponent', ({ children }: { children?: () => string }) => `${children?.() ?? ''}`)

    const child1 = 'Hello'
    const child2 = 'World'

    const element = builder({}).children(child1, child2)

    expect(element.props).toBeDefined()

    const result = element()
    expect(result).toBe('HelloWorld')
  })

  it('should handle function children', () => {
    const builder = createComponent('MyComponent', ({ children }: { children?: () => string }) => `${children?.() ?? ''}`)

    const child = 'Dynamic'

    const element = builder({}).children(child)

    expect(element()).toBe('Dynamic')
  })

  it('should pass children to props correctly as function', () => {
    const MyComponent = createComponent('MyComponent', ({ children }: { children?: FabricNode }) => {
      return children
    })

    const element = MyComponent({}).children('child content')

    expect(element()).toBe('child content')
  })

  it('should allow calling the builder without props and adding children', () => {
    const builder = createComponent('MyComponent', ({ children }: { children?: () => string }) => `${children?.() ?? ''}`)

    const element = builder().children('child content')

    expect(element()).toBe('child content')
  })
})
