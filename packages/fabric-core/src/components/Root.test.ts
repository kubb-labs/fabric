import { afterEach, describe, expect, it, vi } from 'vitest'
import { useContext } from '../composables/useContext.ts'
import type { ComponentNode } from '../composables/useNodeTree.ts'
import { unprovide } from '../context.ts'
import { RootContext, type RootContextProps } from '../contexts/RootContext.ts'
import { FileManager } from '../FileManager.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { Root } from './Root.ts'

function Thrower(): string {
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

  it('should throw when Error occurs', () => {
    const props = getProps()

    const output = Root({ ...props, children: () => Thrower() })()

    expect(props.onError).toHaveBeenCalled()
    expect(output).toMatchInlineSnapshot(`""`)
  })

  it('should have RootContext being defined', () => {
    const props = getProps()

    let context: RootContextProps
    const Test = () => {
      context = useContext(RootContext)

      return ''
    }

    const output = Root({ ...props, children: () => Test() })()

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
