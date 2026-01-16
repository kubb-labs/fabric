import { FileManager, RootContext, TreeNode, unprovide, useContext } from '@kubb/fabric-core'
import type { ComponentNode, RootContextProps } from '@kubb/fabric-core/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import type { KubbNode } from '../types'
import { Root } from './Root.tsx'

function Thrower(): KubbNode {
  throw new Error('boom')
}

function getProps() {
  return {
    onError: vi.fn(),
    onExit: vi.fn(),
    treeNode: new TreeNode<ComponentNode>({ type: 'Root', props: {} }),
    fileManager: new FileManager(),
  }
}

describe('<Root/>', () => {
  afterEach(() => {
    unprovide(RootContext)
  })

  it('should return empty string when no children', async () => {
    const props = getProps()
    const Component = () => {
      return <Root {...props}>Hello from Root</Root>
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"Hello from Root"`)
  })

  it('should return children when provided', async () => {
    const props = getProps()

    const Component = () => {
      return <Root {...props}>Hello from Root</Root>
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toMatchInlineSnapshot(`"Hello from Root"`)
  })

  it('should throw when Error occurs', async () => {
    const props = getProps()

    const Component = () => {
      return (
        <Root {...props}>
          <Thrower />
        </Root>
      )
    }

    const fabric = createReactFabric()

    const output = await fabric.renderToString(Component)

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

    const Component = () => {
      return (
        <Root {...props}>
          <Test />
        </Root>
      )
    }

    const fabric = createReactFabric()

    const output = await fabric.renderToString(Component)

    expect(context!).toBeDefined()
    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should work with multiline', async () => {
    const props = getProps()

    const Component = () => {
      return (
        <Root {...props}>
          {`
      import { test } from 'test'

      export function main() {
        test()
      }
    `}
        </Root>
      )
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toContain('import { test }')
    expect(output).toContain('export function main()')
  })

  it('should preserve whitespace', async () => {
    const props = getProps()

    const children = '  indented\n    more indented'

    const Component = () => {
      return <Root {...props}>{children}</Root>
    }

    const fabric = createReactFabric()
    const output = await fabric.renderToString(Component)

    expect(output).toBe(children)
  })
})
