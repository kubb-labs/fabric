import { Indent } from './Indent.tsx'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { createApp } from '@kubb/fabric-core'

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

    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

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

    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
