import { afterEach, describe, expect, it } from 'vitest'
import { provide, unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { FileContext } from '../contexts/FileContext.ts'
import type { KubbFile } from '../types.ts'
import { useFile } from './useFile.ts'

describe('useFile', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
  })

  it('should return file collector when provided', () => {
    const file: KubbFile.File = {
      baseName: 'index.ts',
      path: '/tmp/index.ts',
      meta: {},
      sources: [],
      imports: [],
      exports: [],
    }

    provide(FileContext, file)

    const result = useFile()

    expect(result).toEqual(file)
  })
})
