import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Type } from './Type.tsx'
import { createApp } from '@kubb/fabric-core'

describe('<Type/>', () => {
  test('render Type', async () => {
    const Component = () => {
      return <Type name="Data">string</Type>
    }
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

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
    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
  })
})
