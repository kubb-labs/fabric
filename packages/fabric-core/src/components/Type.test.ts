import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { unprovide } from '../context.ts'
import { FabricContext } from '../contexts/FabricContext.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { TreeNode } from '../utils/TreeNode.ts'
import { Fabric } from './Fabric.ts'
import { Type, type TypeProps } from './Type.ts'

describe('Type', () => {
  afterEach(() => {
    unprovide(FabricContext)
  })

  const scenarios: Array<{ name: string; props: TypeProps }> = [
    {
      name: 'basic type',
      props: { name: 'MyType', children: '{ a: string }' },
    },
    {
      name: 'exported type',
      props: { name: 'MyType', export: true, children: '{ a: string }' },
    },
    {
      name: 'type with JSDoc',
      props: { name: 'MyType', JSDoc: { comments: ['This is a variable'] }, children: '{ a: string }' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Type(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should throw error if name does not start with capital letter', () => {
    expect(() => {
      Type({ name: 'myType', children: 'string' })()
    }).toThrow('Name should start with a capital letter')
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const component = Fabric({
      meta: {
        name: 'TestApp',
      },
      children: Type({ name: 'MyType', children: '{ a: string }' }),
    })

    const output = await fabric.render(component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    const typeChild = appChild.children[0]!

    expect(typeChild.data.type).toBe('Type')
    expect(typeChild.data.props).toMatchObject({
      name: 'MyType',
    })

    expect(output).toMatchInlineSnapshot(`"type MyType = { a: string }"`)
  })
})
