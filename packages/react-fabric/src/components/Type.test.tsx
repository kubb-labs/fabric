import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
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

    expect(output).toMatchInlineSnapshot(`"type Data = string"`)
  })

  it('render exported Type', async () => {
    const Component = () => {
      return (
        <Type name="MyType" export>
          {'{ a: string }'}
        </Type>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('export type MyType')
  })

  it('render Type with comments', async () => {
    const Component = () => {
      return (
        <Type name="Data" export JSDoc={{ comments: ['@deprecated'] }}>
          number | string
        </Type>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "/**
       * @deprecated
       */
      export type Data = number | string"
    `)
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
