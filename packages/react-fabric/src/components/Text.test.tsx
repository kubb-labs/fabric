import { createApp } from '../createApp.ts'
import { Text } from './Text.tsx'

describe('<Text/>', () => {
  test('render', async () => {
    const Component = () => {
      return <Text>hallo</Text>
    }
    const app = createApp(Component)
    const output = await app.renderToString()

    expect(output).toBe('hallo')
  })
})
