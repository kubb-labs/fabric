import { AppContext, createFabric, inject } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { App } from './App.tsx'
import { Root } from './Root.tsx'

describe('<App/>', () => {
  it('render App with meta and children', async () => {
    const Text = () => {
      const ctx = inject(AppContext)

  it('should return children when provided', async () => {
    const children = 'const x = 1'

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<App>{children}</App>)

    expect(output).toMatchInlineSnapshot(`"AppChildren|meta:{"color":"blue","version":1}|exit:function|"`)
  })

  it('should handle undefined children', async () => {
    const fabric = createReactFabric()
    const output = await fabric.renderToString(<App />)

    expect(output).toBe('')
  })

  it('render App with typed meta', async () => {
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

    expect(output).toBe('code here')
  })

  it('render App with undefined children', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          <App meta={{ test: true }} />
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toBe('')
  })
})
