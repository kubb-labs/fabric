import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Type } from './Type.tsx'

describe('<Type/>', () => {
  it('render Type', async () => {
    const Component = () => {
      return <Type name="Data">string</Type>
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

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
    const Component = () => {
      return <Type name="myType">string</Type>
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    await expect(fabric.renderToString(Component)).rejects.toThrow('Name should start with a capital letter')
  })
})
