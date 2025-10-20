import { createApp } from '../createApp.ts'
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

    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toMatchSnapshot()
  })
})
