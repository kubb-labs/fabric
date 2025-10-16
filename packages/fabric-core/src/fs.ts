import { normalize, relative, resolve } from 'node:path'
import fs from 'fs-extra'
import { switcher } from 'js-runtime'

type Options = { sanity?: boolean }

export async function write(path: string, data: string, options: Options = {}): Promise<string | undefined> {
  if (data.trim() === '') {
    return undefined
  }
  return switcher(
    {
      node: async (path: string, data: string, { sanity }: Options) => {
        try {
          const oldContent = await fs.readFile(resolve(path), {
            encoding: 'utf-8',
          })
          if (oldContent?.toString() === data?.toString()) {
            return
          }
        } catch (_err) {
          /* empty */
        }

        await fs.outputFile(resolve(path), data, { encoding: 'utf-8' })

        if (sanity) {
          const savedData = await fs.readFile(resolve(path), {
            encoding: 'utf-8',
          })

          if (savedData?.toString() !== data?.toString()) {
            throw new Error(`Sanity check failed for ${path}\n\nData[${data.length}]:\n${data}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
          }

          return savedData
        }

        return data
      },
      bun: async (path: string, data: string, { sanity }: Options) => {
        try {
          await Bun.write(resolve(path), data)

          if (sanity) {
            const file = Bun.file(resolve(path))
            const savedData = await file.text()

            if (savedData?.toString() !== data?.toString()) {
              throw new Error(`Sanity check failed for ${path}\n\nData[${path.length}]:\n${path}\n\nSaved[${savedData.length}]:\n${savedData}\n`)
            }

            return savedData
          }

          return data
        } catch (e) {
          console.error(e)
        }
      },
    },
    'node',
  )(path, data.trim(), options)
}

export async function read(path: string): Promise<string> {
  return switcher(
    {
      node: async (path: string) => {
        return fs.readFile(path, { encoding: 'utf8' })
      },
      bun: async (path: string) => {
        const file = Bun.file(path)

        return file.text()
      },
    },
    'node',
  )(path)
}

export function readSync(path: string): string {
  return switcher(
    {
      node: (path: string) => {
        return fs.readFileSync(path, { encoding: 'utf8' })
      },
      bun: () => {
        throw new Error('Bun cannot read sync')
      },
    },
    'node',
  )(path)
}

export async function exists(path: string): Promise<boolean> {
  return switcher(
    {
      node: async (path: string) => {
        return fs.pathExists(path)
      },
      bun: async (path: string) => {
        const file = Bun.file(path)

        return file.exists()
      },
    },
    'node',
  )(path)
}

export function existsSync(path: string): boolean {
  return switcher(
    {
      node: (path: string) => {
        return fs.pathExistsSync(path)
      },
      bun: () => {
        throw new Error('Bun cannot read sync')
      },
    },
    'node',
  )(path)
}

export async function clean(path: string): Promise<void> {
  return fs.remove(path)
}

export async function unlink(path: string): Promise<void> {
  return fs.unlink(path)
}

function slash(path: string, platform: 'windows' | 'mac' | 'linux' = 'linux') {
  const isWindowsPath = /^\\\\\?\\/.test(path)
  const normalizedPath = normalize(path)

  if (['linux', 'mac'].includes(platform) && !isWindowsPath) {
    // linux and mac
    return normalizedPath.replaceAll(/\\/g, '/').replace('../', '')
  }

  // windows
  return normalizedPath.replaceAll(/\\/g, '/').replace('../', '')
}

export function trimExtName(text: string): string {
  return text.replace(/\.[^/.]+$/, '')
}

export function getRelativePath(rootDir?: string | null, filePath?: string | null, platform: 'windows' | 'mac' | 'linux' = 'linux'): string {
  if (!rootDir || !filePath) {
    throw new Error(`Root and file should be filled in when retrieving the relativePath, ${rootDir || ''} ${filePath || ''}`)
  }

  const relativePath = relative(rootDir, filePath)

  // On Windows, paths are separated with a "\"
  // However, web browsers use "/" no matter the platform
  const slashedPath = slash(relativePath, platform)

  if (slashedPath.startsWith('../')) {
    return slashedPath
  }

  return `./${slashedPath}`
}
