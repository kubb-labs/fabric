import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Indent } from './Indent.tsx'

describe('<Indent/>', () => {
  it('indent string children by default size', async () => {
    const Component = () => {
      return (
        <Indent>
          {`
            line1
              line2
            line3
          `}
        </Indent>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "  line1
          line2
        line3"
    `)
  })

  it('indent mixed children and collapse br elements', async () => {
    const Component = () => {
      return (
        <Indent size={4}>
          Hello
          <br />
          <br />
          <br />
          world
          <br />
          <span>!</span>
        </Indent>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`
      "    Hello    
          
          world    
          <span>!</span>"
    `)
  })
})
