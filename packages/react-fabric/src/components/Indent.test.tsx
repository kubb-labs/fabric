import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Indent } from './Indent.tsx'

describe('<Indent/>', () => {
  it('indent string children by default size', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(
      <Indent>
        {`
            line1
              line2
            line3
          `}
      </Indent>,
    )

    expect(output).toMatchInlineSnapshot(`
      "  line1
          line2
        line3"
    `)
  })

  it('indent mixed children and collapse br elements', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(
      <Indent size={4}>
        Hello
        <br />
        <br />
        <br />
        world
        <br />
        <span>!</span>
      </Indent>,
    )

    expect(output).toMatchInlineSnapshot(`
      "    Hello    
          
          world    
          <span>!</span>"
    `)
  })
})
