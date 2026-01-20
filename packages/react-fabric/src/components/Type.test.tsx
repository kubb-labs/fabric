import path from 'node:path'
import { FileManager, TreeNode } from '@kubb/fabric-core'
import { describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { App } from './App.tsx'
import { Root } from './Root.tsx'
import type { TypeProps } from './Type.tsx'
import { Type } from './Type.tsx'

describe('<Type/>', () => {
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
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Type {...props} />)

    await expect(output).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', `${name.replace(/ /g, '_')}.ts`))
  })

  it('should throw error if name does not start with capital letter', async () => {
    const fabric = createReactFabric()

    await expect(fabric.renderToString(<Type name="myType">string</Type>)).rejects.toThrow('Name should start with a capital letter')
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Root treeNode={treeNode} fileManager={new FileManager()} onExit={vi.fn()} onError={vi.fn()}>
        <App>
          <Type name={'MyType'}>{'{ a: string }'}</Type>
        </App>
      </Root>,
    )

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
