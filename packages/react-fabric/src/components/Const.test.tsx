import { Const } from './Const.tsx'
import { createApp } from '@kubb/fabric-core'
import { reactPlugin } from '../plugins/reactPlugin.ts'

describe('<Const/>', () => {
  test('render Const', async () => {
    const Component = () => {
      return <Const name="data">"blue"</Const>
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
  })

  test('render Const with const assertion', async () => {
    const Component = () => {
      return (
        <Const name="data" asConst>
          "blue"
        </Const>
      )
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
