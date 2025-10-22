import path from 'node:path'
import { getRelativePath } from './getRelativePath.ts'
import fs from 'fs-extra'

describe('getRelativePath', () => {
  const mocksPath = path.resolve(__dirname, '../../mocks')
  const filePath = path.resolve(mocksPath, './helloWorld.js')
  const folderPath = path.resolve(mocksPath, './folder')

  afterEach(async () => {
    await fs.remove(filePath)
    await fs.remove(folderPath)
  })

  test('getRelativePath returns correct path for Linux and macOS', async () => {
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
  test('getRelativePath returns correct path for Windows', async () => {
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
