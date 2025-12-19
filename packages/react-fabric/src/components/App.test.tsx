import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { App } from './App.tsx'
import { Root } from './Root.tsx'

describe('<App/>', () => {
  test('render App with meta and children', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          <App meta={{ color: 'blue', version: 1 }}>
            AppChildren
            <App.Context.Consumer>{(ctx) => <>{`|meta:${JSON.stringify(ctx?.meta)}|exit:${typeof ctx?.exit}|`}</>}</App.Context.Consumer>
          </App>
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
