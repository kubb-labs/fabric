import { describe, expect, test, vi } from 'vitest'
import { Root } from '../components/Root'
import { useLifecycle } from './useLifecycle'
import { KubbRenderer } from '../kubbRenderer'
import { ConcurrentRoot } from 'react-reconciler/constants'
import { createNode } from '../dom'

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
    const container = KubbRenderer.createContainer(rootNode, ConcurrentRoot, null, false, false, 'id', console.error, console.error, console.error, null)

    KubbRenderer.updateContainerSync(element, container, null, null)
    KubbRenderer.flushSyncWork()

    expect(onExit).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(onExit).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})
