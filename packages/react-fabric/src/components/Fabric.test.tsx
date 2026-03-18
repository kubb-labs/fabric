import { FabricContext, inject, unprovide } from '@kubb/fabric-core'
import { afterEach, describe, expect, it } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { Fabric } from './Fabric.tsx'

describe('<Fabric/>', () => {
  afterEach(() => {
    unprovide(FabricContext)
  })

  it('should return children when provided', async () => {
    const children = 'const x = 1'

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Fabric>{children}</Fabric>)

    expect(output).toBe(children)
  })

  it('should handle undefined children', async () => {
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Fabric />)

    expect(output).toBe('')
  })

  it('should inject meta data', async () => {
    type Meta = { version: string; author: string }

    const Text = () => {
      const ctx = inject(FabricContext)

      return <>{JSON.stringify(ctx?.meta)}</>
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Fabric<Meta> meta={{ version: '1.0.0', author: 'test' }}>
        <Text />
      </Fabric>,
    )

    expect(output).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
