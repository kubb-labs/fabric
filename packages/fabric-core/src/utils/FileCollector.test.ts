import { afterEach, describe, expect, it } from 'vitest'
import { provide, unprovide } from '../context.ts'
import { FileCollectorContext } from '../contexts/FileCollectorContext.ts'
import { createFile } from '../createFile.ts'
import { FileCollector } from './FileCollector.ts'

describe('File collection via context', () => {
  afterEach(() => {
    // Clean up context after each test
    unprovide(FileCollectorContext)
  })

  it('should collect files via FileCollector context', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    const file = createFile({
      baseName: 'test.ts',
      path: '/src/test.ts',
      sources: [],
      imports: [],
      exports: [],
    })

    collector.add(file)

    expect(collector.files).toHaveLength(1)
    expect(collector.files[0]).toEqual(file)
  })

  it('should collect multiple files from same component', () => {
    const collector = new FileCollector()
    provide(FileCollectorContext, collector)

    const file1 = createFile({
      baseName: 'one.ts',
      path: '/src/one.ts',
      sources: [],
      imports: [],
      exports: [],
    })

    const file2 = createFile({
      baseName: 'two.ts',
      path: '/src/two.ts',
      sources: [],
      imports: [],
      exports: [],
    })

    collector.add(file1)
    collector.add(file2)

    expect(collector.files).toHaveLength(2)
    expect(collector.files).toEqual([file1, file2])
  })
})
