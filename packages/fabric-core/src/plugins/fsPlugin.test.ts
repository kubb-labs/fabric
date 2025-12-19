import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import type { FabricContext } from '../Fabric.ts'
import { fsPlugin, write } from './fsPlugin.ts'

describe('write', () => {
  const mocksPath = path.resolve(__dirname, '../../mocks')
  const filePath = path.resolve(mocksPath, './hellowWorld.js')

  it('should create a file in the mocks folder', async () => {
    const text = `export const hallo = 'world'`

    await write(filePath, text)
    const file = await fs.readFile(filePath, { encoding: 'utf8' })

    expect(file).toBeDefined()
    expect(file).toBe(text)
  })

  it('should not write if file content is the same', async () => {
    const text = `export const hallo = 'world'`

    await write(filePath, text)
    await write(filePath, text)
  })

  it('should not write empty or whitespace-only content', async () => {
    const emptyFilePath = path.resolve(mocksPath, './empty.js')

    const result1 = await write(emptyFilePath, '')
    expect(result1).toBeUndefined()

    const result2 = await write(emptyFilePath, '   ')
    expect(result2).toBeUndefined()

    const result3 = await write(emptyFilePath, undefined)
    expect(result3).toBeUndefined()
  })

  it('should perform sanity check when enabled', async () => {
    const sanityFilePath = path.resolve(mocksPath, './sanity.js')
    const text = `export const test = 'sanity'`

    const result = await write(sanityFilePath, text, { sanity: true })
    expect(result).toBe(text)

    // Clean up
    await fs.remove(sanityFilePath)
  })

  it('should throw error when sanity check fails', async () => {
    const sanityFilePath = path.resolve(mocksPath, './sanity-fail.js')
    // This test verifies the sanity check behavior. The write function trims data before writing,
    // but compares the original (untrimmed) data with the saved (trimmed) data.
    // So if we pass data with trailing whitespace, the sanity check will fail because:
    // - Original data: "export const test = 'sanity'  \n  " (length: 33)
    // - Saved data: "export const test = 'sanity'" (length: 28, trimmed)
    const text = `export const test = 'sanity'  \n  `

    await expect(write(sanityFilePath, text, { sanity: true })).rejects.toThrow('Sanity check failed')

    // Clean up
    await fs.remove(sanityFilePath)
  })

  it('should clean directory at the beginning of plugin generation', async () => {
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

  it('should call onBeforeWrite callback', async () => {
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

  it('should not clean if clean option is not provided', async () => {
    const ctxStub = {
      on: vi.fn(),
    } as unknown as FabricContext

    // Should not throw
    await fsPlugin.install(ctxStub, {})
  })
})
