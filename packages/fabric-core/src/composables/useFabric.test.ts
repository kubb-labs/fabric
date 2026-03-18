import { afterEach, describe, expect, it } from 'vitest'
import { provide, unprovide } from '../context.ts'
import { FabricContext, type FabricContextProps } from '../contexts/FabricContext.ts'
import { useFabric } from './useFabric.ts'

describe('useFabric', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FabricContext)
  })

  it('should return app context when provided', () => {
    const appContext: FabricContextProps = {
      exit: () => {},
      meta: { version: '1.0.0' },
    }

    provide(FabricContext, appContext)

    const result = useFabric()

    expect(result).toBe(appContext)
    expect(result.meta).toEqual({ version: '1.0.0' })
  })

  it('should support generic meta type', () => {
    type CustomMeta = { customField: string }
    const appContext: FabricContextProps<CustomMeta> = {
      exit: () => {},
      meta: { customField: 'custom value' },
    }

    provide(FabricContext, appContext)

    const result = useFabric<CustomMeta>()

    expect(result.meta?.customField).toBe('custom value')
  })
})
