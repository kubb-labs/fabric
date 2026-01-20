import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Const } from './Const.tsx'

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
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Const {...props} />)

    expect(output).toMatchInlineSnapshot(`"const data = "blue""`)
  })

  it('should add nodes to the NodeTreeContext', async () => {
    const treeNode = new TreeNode({ type: 'root', props: {} })

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Root treeNode={treeNode} fileManager={new FileManager()} onExit={vi.fn()} onError={vi.fn()}>
        <App meta={{ name: 'TestApp' }}>
          <Const name={'myVar'}>"hello"</Const>
        </App>
      </Root>,
    )

    expect(output).toContain('export const myVar = "hello"')
  })

  it('render Const with type', async () => {
    const Component = () => {
      return (
        <Const name="myVar" type="string">
          "hello"
        </Const>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('const myVar')
    expect(output).toContain('string')
    expect(output).toContain('"hello"')
  })

  it('render Const with const assertion', async () => {
    const Component = () => {
      return (
        <Const name="data" asConst>
          "blue"
        </Const>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"const data = "blue" as const"`)
  })

  it('render Const with JSDoc', async () => {
    const Component = () => {
      return (
        <Const name="myVar" JSDoc={{ comments: ['This is a variable'] }}>
          "hello"
        </Const>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('This is a variable')
    expect(output).toContain('const myVar = "hello"')
  })
})
