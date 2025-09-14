import { createApp } from '../createApp.ts'
import { Text } from './Text.tsx'

describe('<Text/>', () => {
  test('render', () => {
    const Component = () => {
      return <Text>hallo</Text>
    }
    const app = createApp(Component)
    app.mount()

    expect(app.output).toBe('hallo')
  })
})
