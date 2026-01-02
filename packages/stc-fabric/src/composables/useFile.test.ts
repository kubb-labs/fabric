import { FileCollector } from '@kubb/fabric-core'
import { describe, expect, it } from 'vitest'
import { FileCollectorContext } from '../components/File.ts'
import { provide } from '../context.ts'
import { useFile } from './useFile.ts'

describe('useFile', () => {
  it('should return file collector when provided', () => {
    const collector = new FileCollector()

    provide(FileCollectorContext, collector)

    const result = useFile()

    expect(result).toBe(collector)
  })

  it('should return null when collector is not provided', () => {
    const result = useFile()

    expect(result).toBeNull()
  })
})
