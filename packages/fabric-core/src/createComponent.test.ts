import { describe, expect, it } from 'vitest'
import { Text } from './components/Text.ts'
import { createComponent } from './createComponent.ts'
import type { FabricComponent, FabricNode } from './Fabric.ts'

describe('createComponent', () => {
  it('should create a component builder', () => {
    const MyComponent: FabricComponent<{ name: string }> = ({ name }) => `Hello ${name}`
    const builder = createComponent(MyComponent)

    expect(builder).toBeDefined()
  })

  it('should allow calling the builder with props', () => {
    const MyComponent: FabricComponent<{ name: string }> = ({ name }) => `Hello ${name}`
    const builder = createComponent(MyComponent)
    const element = builder({ name: 'World' })

    expect(element.props).toEqual({ name: 'World' })
    expect(element.component).toBe(MyComponent)

    // Element is also a function that executes the component
    expect(element()).toBe('Hello World')
  })

  it('should allow adding children', () => {
    const MyComponent: FabricComponent<{ children?: () => string }> = ({ children }) => `${children?.() ?? ''}`
    const builder = createComponent(MyComponent)

    const child1 = 'Hello'
    const child2 = 'World'

    const element = builder({}).children(child1, child2)

    expect(element.props).toBeDefined()

    const result = element()
    expect(result).toBe('HelloWorld')
  })

  it('should handle function children', () => {
    const MyComponent: FabricComponent<{ children?: () => string }> = ({ children }) => `${children?.() ?? ''}`
    const builder = createComponent(MyComponent)

    const child = 'Dynamic'

    const element = builder({}).children(child)

    expect(element()).toBe('Dynamic')
  })

  it('should pass children to props correctly as function', () => {
    const MyComponent = createComponent(({ children }: { children?: FabricNode }) => {
      return Text({
        children,
      })
    })

    const element = MyComponent({}).children('child content')

    expect(element()).toBe('child content')
  })

  it('should allow calling the builder without props and adding children', () => {
    const MyComponent: FabricComponent<{ children?: () => string }> = ({ children }) => `${children?.() ?? ''}`
    const builder = createComponent(MyComponent)

    const element = builder().children('child content')

    expect(element()).toBe('child content')
  })
})
