import path from 'node:path'
import fs from 'fs-extra'
import { getRelativePath } from './getRelativePath.ts'

describe('getRelativePath', () => {
  const mocksPath = path.resolve(__dirname, '../../mocks')
  const filePath = path.resolve(mocksPath, './helloWorld.js')
  const folderPath = path.resolve(mocksPath, './folder')

  afterEach(async () => {
    await fs.remove(filePath)
    await fs.remove(folderPath)
  })

  it('should return correct relative path for Linux and macOS', async () => {
    const testFile = path.resolve(folderPath, 'test.js')
    await fs.outputFile(testFile, 'test', { encoding: 'utf-8' })

    expect(getRelativePath(mocksPath, testFile)).toBe('./folder/test.js')

    expect(getRelativePath(folderPath, mocksPath)).toBe('./..')

    try {
      getRelativePath(null, null)
    } catch (e) {
      expect(e).toBeDefined()
    }

    await fs.remove(testFile)
  })
  it('should return correct relative path for Windows', async () => {
    const testFile = path.resolve(folderPath, 'test.js')
    await fs.outputFile(testFile, 'test', { encoding: 'utf-8' })

    expect(getRelativePath(mocksPath, testFile, 'windows')).toBe('./folder/test.js')
    expect(getRelativePath(folderPath, mocksPath, 'windows')).toBe('./..')

    try {
      getRelativePath(null, null)
    } catch (e) {
      expect(e).toBeDefined()
    }

    await fs.remove(testFile)
  })
})
