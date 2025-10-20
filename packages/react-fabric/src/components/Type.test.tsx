import { createApp } from '../createApp.ts'
import { Type } from './Type.tsx'

describe('<Type/>', () => {
  test('render Type', async () => {
    const Component = () => {
      return <Type name="Data">string</Type>
    }
    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toMatchSnapshot()
  })

  test('render Type with comments', async () => {
    const Component = () => {
      return (
        <Type name="Data" export JSDoc={{ comments: ['@deprecated'] }}>
          number | string
        </Type>
      )
    }
    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toMatchSnapshot()
  })
})
