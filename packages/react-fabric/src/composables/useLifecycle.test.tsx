import { ConcurrentRoot } from 'react-reconciler/constants.js'
import { describe, expect, test, vi } from 'vitest'
import { Root } from '../components/Root'
import { createNode } from '../dom'
import { Renderer } from '../Renderer.ts'
import { useLifecycle } from './useLifecycle'

describe('useLifecycle', () => {
  test('exit schedules Root.onExit asynchronously', async () => {
    vi.useFakeTimers()
    const onExit = vi.fn()

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { exit } = useLifecycle()
      // call exit on mount
      exit()
      return null
    }

    const element = (
      <Root
        onExit={onExit}
        onError={(e) => {
          throw e
        }}
      >
        <Test />
      </Root>
    )

    // Create a container similar to ReactTemplate
    const rootNode = createNode('kubb-root')
    const container = Renderer.createContainer(rootNode, ConcurrentRoot, null, false, false, 'id', console.error, console.error, console.error, null)

    Renderer.updateContainerSync(element, container, null, null)
    Renderer.flushSyncWork()

    expect(onExit).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(onExit).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})
