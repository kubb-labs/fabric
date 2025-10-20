import { createApp } from '../createApp.ts'
import { Const } from './Const.tsx'

describe('<Const/>', () => {
  test('render Const', async () => {
    const Component = () => {
      return <Const name="data">"blue"</Const>
    }
    const app = createApp(Component)
    const output = await app.renderToString()

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
    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toMatchSnapshot()
  })
})
