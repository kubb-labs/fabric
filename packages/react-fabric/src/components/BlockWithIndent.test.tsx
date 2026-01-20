import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { BlockWithIndent } from './BlockWithIndent.tsx'

describe('<BlockWithIndent/>', () => {
  it('should wrap children with proper indentation', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const output = await fabric.renderToString(
      <BlockWithIndent>
        const x = 1;
        <br />
        const y = 2;
      </BlockWithIndent>,
    )

    expect(output).toMatchInlineSnapshot(`
      "
        const x = 1;  
        const y = 2;
      "
    `)
  })

  it('should use custom indent size', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const output = await fabric.renderToString(
      <BlockWithIndent size={4}>
        const x = 1;
      </BlockWithIndent>,
    )

    expect(output).toMatchInlineSnapshot(`
      "
          const x = 1;
      "
    `)
  })

  it('should handle empty children', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const output = await fabric.renderToString(<BlockWithIndent />)

    expect(output).toBe('')
  })

  it('should work within function blocks', async () => {
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const output = await fabric.renderToString(
      <>
        function test() {'{'}
        <BlockWithIndent>
          return 42;
        </BlockWithIndent>
        {'}'}
      </>,
    )

    expect(output).toMatchInlineSnapshot(`
      "function test() {
        return 42;
      }"
    `)
  })
})
