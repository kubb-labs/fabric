import { createApp } from '../createApp.ts'
import { Type } from './Type.tsx'

describe('<Type/>', () => {
  test('render Type', async () => {
    const Component = () => {
      return <Type name="Data">string</Type>
    }
    const app = createApp(Component)
    app.mount()

    expect(app.output).toMatchSnapshot()
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
    app.mount()

    expect(app.output).toMatchSnapshot()
  })
})
