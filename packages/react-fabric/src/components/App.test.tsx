import { AppContext, createFabric, inject } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { App } from './App.tsx'
import { Root } from './Root.tsx'

describe('<App/>', () => {
  it('render App with meta and children', async () => {
    const Text = () => {
      const ctx = inject(AppContext)

      return <>{`|meta:${JSON.stringify(ctx?.meta)}|exit:${typeof ctx?.exit}|`}</>
    }
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          <App meta={{ color: 'blue', version: 1 }}>
            AppChildren
            <Text />
          </App>
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"AppChildren|meta:{"color":"blue","version":1}|exit:function|"`)
  })

  it('render App without children', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          <App meta={{}} />
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toBe('')
  })

  it('render App with typed meta', async () => {
    type Meta = { version: string; author: string }
    const Component = () => {
      const meta: Meta = { version: '1.0.0', author: 'test' }
      return (
        <Root onExit={() => {}} onError={() => {}}>
          <App meta={meta}>code here</App>
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

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
