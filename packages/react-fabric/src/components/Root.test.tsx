import { vi } from 'vitest'
import { Root } from './Root.tsx'
import { createApp } from '@kubb/fabric-core'
import { reactPlugin } from '../plugins/reactPlugin.ts'

function Thrower(): React.ReactNode {
  throw new Error('boom')
}

describe('<Root/>', () => {
  test('render Root with children', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          Hello from Root
        </Root>
      )
    }

    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
  })

  test('error boundary should catch and call onError', async () => {
    const onError = vi.fn()
    const onExit = vi.fn()

    const Component = () => {
      return (
        <Root onExit={onExit} onError={onError}>
          <Thrower />
        </Root>
      )
    }

    const app = createApp()
    app.use(reactPlugin)
    const output = await app.renderToString(Component)

    expect(output).toMatchSnapshot()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onExit).not.toHaveBeenCalled()
  })
})
