import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { unprovide } from '../context.ts'
import { AppContext } from '../contexts/AppContext.ts'
import { createFabric } from '../createFabric.ts'
import { fsxPlugin } from '../plugins'
import { TreeNode } from '../utils/TreeNode.ts'
import { App } from './App.ts'
import { Const, type ConstProps } from './Const.ts'

describe('Const', () => {
  afterEach(() => {
    unprovide(AppContext)
  })

  const scenarios: Array<{ name: string; props: ConstProps }> = [
    {
      name: 'basic const',
      props: { name: 'myVar', children: '"hello"' },
    },
    {
      name: 'exported const',
      props: { name: 'myVar', export: true, children: '"hello"' },
    },
    {
      name: 'const with type',
      props: { name: 'myVar', type: 'string', children: '"hello"' },
    },
    {
      name: 'const with as const',
      props: { name: 'myVar', asConst: true, children: '"hello"' },
    },
    {
      name: 'const with JSDoc',
      props: { name: 'myVar', JSDoc: { comments: ['This is a variable'] }, children: '"hello"' },
    },
  ]

  it.each(scenarios)('should create a $name', async ({ name, props }) => {
    const output = Const(props)()

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const fabric = createFabric()
    const treeNode = new TreeNode({ type: 'root', props: {} })

    fabric.use(fsxPlugin, { treeNode })

    const component = App({
      meta: {
        name: 'TestApp',
      },
      children: Const({ name: 'myVar', children: '"hello"' }),
    })
    expect(result).toMatchInlineSnapshot(`
      "/**
       * This is a variable
       */
      const myVar = "hello""
    `)
    expect(result).toContain('const myVar = "hello"')
  })

    const output = await fabric.render(component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const result = App({
      tree,
      meta: {
        name: 'TestApp',
      },
      children: () => Const({ name: 'myVar', children: '"hello"' }),
    })

    expect(tree.children).toHaveLength(1)
    const child = tree.children[0]!
    expect(child.data).toMatchObject({
      type: 'Const',
      props: expect.objectContaining({ name: 'myVar' }),
    })

    expect(result).toMatchInlineSnapshot(`"const myVar = "hello""`)
  })
})
