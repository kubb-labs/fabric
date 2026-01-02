import { describe, expect, it } from 'vitest'
import { createStcFabric, File, stc } from './index.ts'

describe('File collection via context', () => {
  it('should collect files via FileCollector context', async () => {
    const fabric = createStcFabric()

    const MyComponent = stc<{ name: string }>((props) => {
      File({
        baseName: 'test.ts',
        path: './test.ts',
        meta: {},
      })

      return `const ${props.name} = true;`
    })

    await fabric.render(MyComponent)

    const files = (fabric as any).fileManager.files
    expect(files).toHaveLength(1)
    expect(files[0]?.baseName).toBe('test.ts')
    expect(files[0]?.path).toBe('./test.ts')
  })

  it('should collect multiple files from same component', async () => {
    const fabric = createStcFabric()

    const MultiFileComponent = stc(() => {
      File({
        baseName: 'file1.ts',
        path: './file1.ts',
      })

      File({
        baseName: 'file2.ts',
        path: './file2.ts',
      })

      return '// Generated code'
    })

    await fabric.render(MultiFileComponent)

    const files = (fabric as any).fileManager.files
    expect(files).toHaveLength(2)
    expect(files.map((f: any) => f?.baseName)).toEqual(['file1.ts', 'file2.ts'])
  })
})
