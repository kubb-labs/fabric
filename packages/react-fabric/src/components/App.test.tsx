import { AppContext, inject, unprovide } from '@kubb/fabric-core'
import { afterEach, describe, expect, it } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import { App } from './App.tsx'

describe('<App/>', () => {
  afterEach(() => {
    unprovide(AppContext)
  })

  it('should return children when provided', async () => {
    const children = 'const x = 1'

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<App>{children}</App>)

    expect(output).toBe(children)
  })

  it('should handle undefined children', async () => {
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<App />)

    expect(output).toBe('')
  })

  it('should inject meta data', async () => {
    type Meta = { version: string; author: string }

    const Text = () => {
      const ctx = inject(AppContext)

      return <>{JSON.stringify(ctx?.meta)}</>
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <App<Meta> meta={{ version: '1.0.0', author: 'test' }}>
        <Text />
      </App>,
    )

    expect(output).toMatchInlineSnapshot(`"{"version":"1.0.0","author":"test"}"`)
  })
})
