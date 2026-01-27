import { FileManager, RootContext, TreeNode, unprovide, useContext } from '@kubb/fabric-core'
import type { ComponentNode, RootContextProps } from '@kubb/fabric-core/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReactFabric } from '../createReactFabric.ts'
import type { FabricReactNode } from '../types'
import { Root } from './Root.tsx'

function Thrower(): FabricReactNode {
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

    expect(output).toBe(children)
  })
})
