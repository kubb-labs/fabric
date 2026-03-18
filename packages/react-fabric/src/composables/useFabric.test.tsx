import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { Fabric } from '../components/Fabric.tsx'
import { reactPlugin } from '../plugins/reactPlugin'
import { useFabric } from './useFabric.ts'

describe('useFabric', () => {
  test('returns meta and exit when used inside <App />', async () => {
    let value: ReturnType<typeof useFabric<{ count: number }>> | undefined

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      value = useFabric<{ count: number }>()
      return null
    }

    const meta = { count: 1 }
    const fabric = createFabric()
    fabric.use(reactPlugin)

    const Component = (
      <Fabric meta={meta}>
        <Test />
      </Fabric>
    )

    await fabric.render(Component)

    expect(value).toBeDefined()
    expect(value?.meta).toEqual(meta)
    expect(typeof value?.exit).toBe('function')
  })
})
