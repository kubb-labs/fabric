import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Const } from './Const.tsx'

describe('<Const/>', () => {
  it('render Const', async () => {
    const Component = () => {
      return <Const name="data">"blue"</Const>
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"const data = "blue""`)
  })

  it('render exported Const', async () => {
    const Component = () => {
      return (
        <Const name="myVar" export>
          "hello"
        </Const>
      )
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

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
