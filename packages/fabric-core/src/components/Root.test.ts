import { afterEach, describe, expect, it, vi } from 'vitest'
import { useContext } from '../composables/useContext.ts'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { unprovide } from '../context.ts'
import { RootContext, type RootContextProps } from '../contexts/RootContext.ts'
import { createComponent } from '../createComponent.ts'
import { createFabric } from '../createFabric.ts'
import { FileManager } from '../FileManager.ts'
import { fsxPlugin } from '../plugins'
import { TreeNode } from '../utils/TreeNode.ts'
import { Root } from './Root.ts'

function getProps() {
  return {
    onError: vi.fn(),
    onExit: vi.fn(),
    treeNode: new TreeNode<ComponentNode>({ type: 'Root', props: {} }),
    fileManager: new FileManager(),
  }
}

describe('Root', () => {
  afterEach(() => {
    unprovide(RootContext)
  })

  it('should return empty string when no children', () => {
    const props = getProps()

    const output = Root(props)()

    expect(output).toMatchInlineSnapshot('""')
  })

  it('should return children when provided', () => {
    const props = getProps()

    const output = Root({ ...props, children: 'Hello from Root' })()

    expect(output).toMatchInlineSnapshot(`"Hello from Root"`)
  })

  it('should throw when Error occurs', async () => {
    const fabric = createFabric()

    fabric.use(fsxPlugin)

    const Test = createComponent(() => {
      throw new Error('boom')
    })

    try {
      await fabric.render(Test())
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).message).toBe('boom')
    }
  })

  it('should have RootContext being defined', () => {
    const props = getProps()

    let context: RootContextProps
    const Test = createComponent(() => {
      context = useContext(RootContext)

      return ''
    })

    const output = Root({ ...props, children: Test() })()

    expect(context!).toBeDefined()
    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should work with multiline', () => {
    const props = getProps()

    const children = `
      import { test } from 'test'

      export function main() {
        test()
      }
    `
    const output = Root({ ...props, children })()

    expect(output).toContain('import { test }')
    expect(output).toContain('export function main()')
  })

  it('should preserve whitespace', () => {
    const props = getProps()

    const children = '  indented\n    more indented'
    const output = Root({ ...props, children })()

    expect(output).toBe(children)
  })
})
