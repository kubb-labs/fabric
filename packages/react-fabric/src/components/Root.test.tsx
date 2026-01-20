import { createFabric } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Root } from './Root.tsx'

function Thrower(): React.ReactNode {
  throw new Error('boom')
}

describe('<Root/>', () => {
  afterEach(() => {
    unprovide(RootContext)
  })

  it('should return empty string when no children', async () => {
    const props = getProps()

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Root {...props}>Hello from Root</Root>)

    expect(output).toMatchInlineSnapshot(`"Hello from Root"`)
  })

  it('should return children when provided', async () => {
    const props = getProps()

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Root {...props}>Hello from Root</Root>)

    expect(output).toMatchInlineSnapshot(`"Hello from Root"`)
  })

  it('should throw when Error occurs', async () => {
    const props = getProps()

    const fabric = createReactFabric()

    const output = await fabric.renderToString(
      <Root {...props}>
        <Thrower />
      </Root>,
    )

    expect(props.onError).toHaveBeenCalled()
    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should have RootContext being defined', async () => {
    const props = getProps()

    let context: RootContextProps

    const Test = () => {
      context = useContext(RootContext)

      return ''
    }

    const fabric = createReactFabric()

    const output = await fabric.renderToString(
      <Root {...props}>
        <Test />
      </Root>,
    )

    expect(context!).toBeDefined()
    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should work with multiline', async () => {
    const props = getProps()

    const fabric = createReactFabric()
    const output = await fabric.renderToString(
      <Root {...props}>
        {`
      import { test } from 'test'

      export function main() {
        test()
      }
    `}
      </Root>,
    )

    expect(output).toContain('import { test }')
    expect(output).toContain('export function main()')
  })

  it('should preserve whitespace', async () => {
    const props = getProps()

    const children = '  indented\n    more indented'

    const fabric = createReactFabric()
    const output = await fabric.renderToString(<Root {...props}>{children}</Root>)

    expect(output).toBe('  indented\n    more indented')
  })

  it('error boundary should catch and throw error', async () => {
    const Component = () => {
      return <Thrower />
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)

    // The error should now be thrown
    await expect(fabric.renderToString(Component)).rejects.toThrow('boom')
  })
})
