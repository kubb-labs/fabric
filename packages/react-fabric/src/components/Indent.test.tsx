import { createApp } from '../createApp.ts'
import { Indent } from './Indent.tsx'

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

    const app = createApp(Component)
    const output = await app.renderToString()

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

    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toMatchSnapshot()
  })
})
