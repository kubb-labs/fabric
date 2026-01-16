import path from 'node:path'
import { FileManager, TreeNode } from '@kubb/fabric-core'
import { describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { App } from './App.tsx'
import { Const, type ConstProps } from './Const.tsx'
import { Root } from './Root.tsx'

describe('<Const/>', () => {
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
    const Component = () => {
      return <Const {...props} />
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const Component = () => {
      return (
        <Root treeNode={treeNode} fileManager={new FileManager()} onExit={vi.fn()} onError={vi.fn()}>
          <App meta={{ name: 'TestApp' }}>
            <Const name={'myVar'}>"hello"</Const>
          </App>
        </Root>
      )
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(treeNode.data.type).toBe('root')
    expect(treeNode.children).toHaveLength(1)

    const appChild = treeNode.children[0]!
    expect(appChild.data.type).toBe('App')
    expect(appChild.data.props).toMatchObject({
      meta: {
        name: 'TestApp',
      },
    })

    const constChild = appChild.children[0]!

    expect(constChild.data.type).toBe('Const')
    expect(constChild.data.props).toMatchObject({
      name: 'myVar',
    })

    expect(output).toMatchInlineSnapshot(`"const myVar = "hello""`)
  })
})
