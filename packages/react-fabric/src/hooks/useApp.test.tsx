import { describe, expect, test } from 'vitest'

import { App } from '../components/App'
import { useApp } from './useApp'
import { createApp as createReactApp } from '../createApp'

describe('useApp', () => {
  test('returns meta and exit when used inside <App />', async () => {
    let value: ReturnType<typeof useApp<{ count: number }>> | undefined

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      value = useApp<{ count: number }>()
      return null
    }

    const meta = { count: 1 }
    const app = createReactApp(() => (
      <App meta={meta}>
        <Test />
      </App>
    ))

    await app.render()

    expect(value).toBeDefined()
    expect(value?.meta).toEqual(meta)
    expect(typeof value?.exit).toBe('function')
  })
})
