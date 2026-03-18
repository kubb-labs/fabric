import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { unprovide } from '../context.ts'
import { FabricContext } from '../contexts/FabricContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { TreeNode } from '../utils/TreeNode.ts'
import { Fabric } from './Fabric.ts'
import { Function } from './Function.ts'

describe('Function', () => {
  afterEach(() => {
    unprovide(FabricContext)
  })

  const Component = createComponent('test', () => {
    return 'return true'
  })

  const scenarios: Array<{ name: string; props: any }> = [
    { name: 'basic function', props: { name: 'myFunc', children: Component() } },
    { name: 'exported function', props: { name: 'myFunc', export: true, children: 'return true' } },
    { name: 'function with parameters', props: { name: 'myFunc', params: 'a: string, b: number', children: 'return true' } },
    { name: 'async function', props: { name: 'myFunc', async: true, children: 'return true' } },
    { name: 'function with generics', props: { name: 'myFunc', generics: 'T', children: 'return true' } },
    { name: 'function with return type', props: { name: 'myFunc', returnType: 'boolean', children: 'return true' } },
    { name: 'async function with Promise return type', props: { name: 'myFunc', async: true, returnType: 'boolean', children: 'return true' } },
    { name: 'function with JSDoc', props: { name: 'myFunc', JSDoc: { comments: ['@deprecated'] }, children: 'return true' } },
    { name: 'default exported function', props: { name: 'myFunc', export: true, default: true, children: 'return true' } },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Function(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const output = await fabric.render(
      Fabric({
        children: Function({ name: 'myFunc', children: 'return true' }),
      }),
    )

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('Function')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`
      "function myFunc() {
        return true
      }"
    `)
  })
})

describe('Function.Arrow', () => {
  const scenarios: Array<{ name: string; props: any }> = [
    { name: 'basic arrow function', props: { name: 'myFunc', children: 'return true' } },
    { name: 'single line arrow function', props: { name: 'myFunc', singleLine: true, children: 'true' } },
    { name: 'exported arrow function', props: { name: 'myFunc', export: true, children: 'return true' } },
    { name: 'async arrow function', props: { name: 'myFunc', async: true, children: 'return true' } },
    { name: 'arrow function with generics', props: { name: 'getData', generics: 'TData', returnType: 'number', children: 'return 2' } },
    { name: 'default exported arrow function', props: { name: 'myFunc', export: true, default: true, children: 'return true' } },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Function.Arrow(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const component = Fabric({
      children: Function.Arrow({ name: 'myFunc', children: 'return true' }),
    })

    const output = await fabric.render(component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const functionChild = appChild.children[0]!

    expect(functionChild.data.type).toBe('ArrowFunction')
    expect(functionChild.data.props).toMatchObject({ name: 'myFunc' })

    expect(output).toMatchInlineSnapshot(`
      "const myFunc = () => {
        return true
      }"
    `)
  })
})
