import { afterEach, describe, expect, it } from 'vitest'
import { provide, unprovide } from '../context.ts'
import { AppContext, type AppContextProps } from '../contexts/AppContext.ts'
import { useApp } from './useApp.ts'

describe('useApp', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(AppContext)
  })

  it('should return app context when provided', () => {
    const appContext: AppContextProps = {
      exit: () => {},
      meta: { version: '1.0.0' },
    }

    provide(AppContext, appContext)

    const result = useApp()

    expect(result).toBe(appContext)
    expect(result.meta).toEqual({ version: '1.0.0' })
  })

  it('should support generic meta type', () => {
    type CustomMeta = { customField: string }
    const appContext: AppContextProps<CustomMeta> = {
      exit: () => {},
      meta: { customField: 'custom value' },
    }

    provide(AppContext, appContext)

    const result = useApp<CustomMeta>()

    expect(result.meta?.customField).toBe('custom value')
  })
})
