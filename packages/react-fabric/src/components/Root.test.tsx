import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test, vi } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Root } from './Root.tsx'

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

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
  })

  test('error boundary should catch and throw error', async () => {
    const Component = () => {
      return <Thrower />
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    
    // The error should now be thrown
    await expect(fabric.renderToString(Component)).rejects.toThrow('boom')
  })
})
