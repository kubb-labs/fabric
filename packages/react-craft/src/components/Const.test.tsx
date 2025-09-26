import { createApp } from '../createApp.ts'
import { Const } from './Const.tsx'

describe('<Const/>', () => {
  test('render Const', () => {
    const Component = () => {
      return <Const name="data">"blue"</Const>
    }
    const app = createApp(Component)
    app.run()

    expect(app.output).toMatchSnapshot()
  })

  test('render Const with const assertion', () => {
    const Component = () => {
      return (
        <Const name="data" asConst>
          "blue"
        </Const>
      )
    }
    const app = createApp(Component)
    app.run()

    expect(app.output).toMatchSnapshot()
  })
})
