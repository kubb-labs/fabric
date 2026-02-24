import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { getRelativePath } from './getRelativePath.ts'

describe('getRelativePath', () => {
  const mocksPath = path.resolve(__dirname, '../../mocks')
  const filePath = path.resolve(mocksPath, './helloWorld.js')
  const folderPath = path.resolve(mocksPath, './folder')

  afterEach(async () => {
    await rm(filePath, { force: true })
    await rm(folderPath, { recursive: true, force: true })
  })

  it('should return correct relative path for Linux and macOS', async () => {
    const testFile = path.resolve(folderPath, 'test.js')
    await mkdir(folderPath, { recursive: true })
    await writeFile(testFile, 'test', { encoding: 'utf-8' })

    expect(getRelativePath(mocksPath, testFile)).toBe('./folder/test.js')

    expect(getRelativePath(folderPath, mocksPath)).toBe('./..')

    try {
      getRelativePath(null, null)
    } catch (e) {
      expect(e).toBeDefined()
    }

    await rm(testFile, { force: true })
  })
  it('should return correct relative path for Windows', async () => {
    const testFile = path.resolve(folderPath, 'test.js')
    await mkdir(folderPath, { recursive: true })
    await writeFile(testFile, 'test', { encoding: 'utf-8' })

    expect(getRelativePath(mocksPath, testFile, 'windows')).toBe('./folder/test.js')
    expect(getRelativePath(folderPath, mocksPath, 'windows')).toBe('./..')

    try {
      getRelativePath(null, null)
    } catch (e) {
      expect(e).toBeDefined()
    }

    await rm(testFile, { force: true })
  })
})
