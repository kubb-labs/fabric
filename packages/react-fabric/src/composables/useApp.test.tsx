import { describe, expect, test } from 'vitest'

import { App } from '../components/App'
import { useApp } from './useApp'
import { createFabric } from '@kubb/fabric-core'
import { reactPlugin } from '../plugins/reactPlugin'

describe('useApp', () => {
  test('returns meta and exit when used inside <App />', async () => {
    let value: ReturnType<typeof useApp<{ count: number }>> | undefined

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      value = useApp<{ count: number }>()
      return null
    }

    const meta = { count: 1 }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const Component = () => (
      <App meta={meta}>
        <Test />
      </App>
    )

    await fabric.render(Component)

    expect(value).toBeDefined()
    expect(value?.meta).toEqual(meta)
    expect(typeof value?.exit).toBe('function')
  })
})
