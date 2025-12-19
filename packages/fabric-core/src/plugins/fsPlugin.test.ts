import path from 'node:path'
import fs from 'fs-extra'
import type { FabricContext } from '../Fabric.ts'
import { fsPlugin, write } from './fsPlugin.ts'

describe('write', () => {
  const mocksPath = path.resolve(__dirname, '../../mocks')
  const filePath = path.resolve(mocksPath, './hellowWorld.js')

  test('if write is creating a file in the mocks folder', async () => {
    const text = `export const hallo = 'world'`

    await write(filePath, text)
    const file = await fs.readFile(filePath, { encoding: 'utf8' })

    expect(file).toBeDefined()
    expect(file).toBe(text)
  })

  test('do not write if file content is the same', async () => {
    const text = `export const hallo = 'world'`

    await write(filePath, text)
    await write(filePath, text)
  })

  test('should not write empty or whitespace-only content', async () => {
    const emptyFilePath = path.resolve(mocksPath, './empty.js')
    
    const result1 = await write(emptyFilePath, '')
    expect(result1).toBeUndefined()
    
    const result2 = await write(emptyFilePath, '   ')
    expect(result2).toBeUndefined()
    
    const result3 = await write(emptyFilePath, undefined)
    expect(result3).toBeUndefined()
  })

  test('should perform sanity check when enabled', async () => {
    const sanityFilePath = path.resolve(mocksPath, './sanity.js')
    const text = `export const test = 'sanity'`

    const result = await write(sanityFilePath, text, { sanity: true })
    expect(result).toBe(text)
    
    // Clean up
    await fs.remove(sanityFilePath)
  })

  test('should throw error when sanity check fails', async () => {
    const sanityFilePath = path.resolve(mocksPath, './sanity-fail.js')
    const text = `export const test = 'sanity'  \n  `  // Data with trailing whitespace

    // Write the file first with different content (trimmed version won't match)
    await fs.outputFile(sanityFilePath, 'different content', { encoding: 'utf-8' })

    await expect(write(sanityFilePath, text, { sanity: true })).rejects.toThrow('Sanity check failed')
    
    // Clean up
    await fs.remove(sanityFilePath)
  })

  test('clean at the beginning of the plugin generation', async () => {
    const cleanDir = path.resolve(mocksPath, './tmp-clean')
    const nestedFile = path.resolve(cleanDir, 'test.txt')

    await fs.ensureDir(cleanDir)
    await fs.outputFile(nestedFile, 'should be removed')

    expect(await fs.pathExists(cleanDir)).toBe(true)
    expect(await fs.pathExists(nestedFile)).toBe(true)

    const ctxStub = {
      on: vi.fn(),
    } as unknown as FabricContext

    await fsPlugin.install(ctxStub, { clean: { path: cleanDir } })

    expect(await fs.pathExists(cleanDir)).toBe(false)
  })

  test('should call onBeforeWrite callback', async () => {
    const onBeforeWriteMock = vi.fn()
    const testFilePath = path.resolve(mocksPath, './onbeforewrite-test.js')
    
    const ctxStub = {
      on: vi.fn((event, handler) => {
        if (event === 'file:processing:update') {
          // Simulate the event
          handler({ file: { path: testFilePath }, source: 'test content' })
        }
      }),
    } as unknown as FabricContext

    await fsPlugin.install(ctxStub, { onBeforeWrite: onBeforeWriteMock })

    expect(onBeforeWriteMock).toHaveBeenCalledWith(testFilePath, 'test content')
    
    // Clean up
    await fs.remove(testFilePath).catch(() => {})
  })

  test('should not clean if clean option is not provided', async () => {
    const ctxStub = {
      on: vi.fn(),
    } as unknown as FabricContext

    // Should not throw
    await fsPlugin.install(ctxStub, {})
  })
})
