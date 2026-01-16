import { afterEach, describe, expect, it, vi } from 'vitest'

import { provide, unprovide } from '../context.ts'
import { RootContext } from '../contexts/RootContext.ts'
import { FileManager } from '../FileManager.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { useLifecycle } from './useLifecycle.ts'
import type { ComponentNode } from './useNodeTree.ts'

describe('useLifecycle', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(RootContext)
  })

  it('should return exit function from root context', () => {
    const exitMock = vi.fn()

    provide(RootContext, { exit: exitMock, treeNode: new TreeNode<ComponentNode>({ type: 'root', props: {} }), fileManager: new FileManager() })

    const { exit } = useLifecycle()

    exit()

    expect(exitMock).toHaveBeenCalledOnce()
  })

  it('should use default no-op exit when context not provided', () => {
    const { exit } = useLifecycle()

    // Should not throw
    expect(() => exit()).not.toThrow()
  })
})
