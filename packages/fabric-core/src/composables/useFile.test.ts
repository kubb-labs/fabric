import { afterEach, describe, expect, it } from 'vitest'
import { provide, unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { FileCollector } from '../utils/FileCollector.ts'
import { useFile } from './useFile.ts'

describe('useFile', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
  })

  it('should return file collector when provided', () => {
    const collector = new FileCollector()

    provide(FileCollectorContext, collector)

    const result = useFile()

    expect(result).toBe(collector)
  })
})
