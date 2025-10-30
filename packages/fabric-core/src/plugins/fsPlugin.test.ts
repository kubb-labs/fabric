import path from 'node:path'
import fs from 'fs-extra'
import type { Fabric } from '../Fabric.ts'
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

  test('clean at the beginning of the plugin generation', async () => {
    const cleanDir = path.resolve(mocksPath, './tmp-clean')
    const nestedFile = path.resolve(cleanDir, 'test.txt')

    await fs.ensureDir(cleanDir)
    await fs.outputFile(nestedFile, 'should be removed')

    expect(await fs.pathExists(cleanDir)).toBe(true)
    expect(await fs.pathExists(nestedFile)).toBe(true)

    const appStub = {
      context: {
        events: { on: vi.fn() },
      },
    } as unknown as Fabric

    await fsPlugin.install(appStub, { clean: { path: cleanDir } })

    expect(await fs.pathExists(cleanDir)).toBe(false)
  })
})
