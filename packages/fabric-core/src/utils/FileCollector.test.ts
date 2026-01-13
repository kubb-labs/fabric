import { afterEach, describe, it } from 'vitest'
import { unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'

describe('File collection via context', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
  })

  it.todo('should collect files via FileCollector context')
  it.todo('should collect multiple files from same component')
})
