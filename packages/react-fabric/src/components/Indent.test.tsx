import { Indent } from './Indent.tsx'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { createFabric } from '@kubb/fabric-core'

describe('<Indent/>', () => {
  test('indent string children by default size', async () => {
    const Component = () => {
      return (
        <Indent>
          {`
            line1
              line2
            line3
          `}
        </Indent>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
  })

  test('indent mixed children and collapse br elements', async () => {
    const Component = () => {
      return (
        <Indent size={4}>
          Hello
          <br />
          <br />
          <br />
          world
          <br />
          <span>!</span>
        </Indent>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
