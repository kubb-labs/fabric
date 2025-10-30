import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Const } from './Const.tsx'

describe('<Const/>', () => {
  test('render Const', async () => {
    const Component = () => {
      return <Const name="data">"blue"</Const>
    }
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

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
    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
