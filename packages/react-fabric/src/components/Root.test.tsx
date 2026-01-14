import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
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

  test('render Root with multiline children', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          {`
      import { test } from 'test'

      export function main() {
        test()
      }
    `}
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toContain('import { test }')
    expect(output).toContain('export function main()')
  })

  test('render Root with whitespace preservation', async () => {
    const Component = () => {
      return (
        <Root onExit={() => {}} onError={() => {}}>
          {'  indented\n    more indented'}
        </Root>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toBe('  indented\n    more indented')
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
