/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: not needed */

import { createPlugin } from './createPlugin.ts'
import type * as KubbFile from '../KubbFile.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import path, { resolve } from 'node:path'
import { getRelativePath } from '../utils/getRelativePath.ts'

type Mode = 'all' | 'named' | 'propagate' | false

type Options = {
  root: string
  mode: Mode
}

type ExtendOptions = {
  writeEntry(options: Options): Promise<void>
}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface App {
    writeEntry(options: Options): Promise<void>
  }
}

declare global {
  namespace Kubb {
    interface App {
      writeEntry(options: Options): Promise<void>
    }
  }
}

type GetBarrelFilesOptions = {
  files: KubbFile.File[]
  root: string
  mode: Mode
}

export function getBarrelFiles({ files, root, mode }: GetBarrelFilesOptions): Array<KubbFile.File> {
  const cachedFiles = new Map<KubbFile.Path, KubbFile.File>()

  if (mode === 'propagate') {
    return []
  }

  TreeNode.build(files, root)?.forEach((treeNode) => {
    if (!treeNode || !treeNode.children || !treeNode.parent?.data.path) {
      return undefined
    }

    const barrelFile: KubbFile.File = {
      path: path.join(treeNode.parent?.data.path, 'index.ts') as KubbFile.Path,
      baseName: 'index.ts',
      exports: [],
      sources: [],
    }
    const previousBarrelFile = cachedFiles.get(barrelFile.path)
    const leaves = treeNode.leaves

    leaves.forEach((item) => {
      if (!item.data.name) {
        return undefined
      }

      const sources = item.data.file?.sources || []

      if (!sources.some((source) => source.isIndexable)) {
        console.warn(`No isIndexable source found(source should have a name and isIndexable):\nFile: ${JSON.stringify(item.data.file, undefined, 2)}`)
      }

      sources.forEach((source) => {
        if (!item.data.file?.path || !source.isIndexable || !source.name) {
          return undefined
        }
        const alreadyContainInPreviousBarrelFile = previousBarrelFile?.sources.some(
          (item) => item.name === source.name && item.isTypeOnly === source.isTypeOnly,
        )

        if (alreadyContainInPreviousBarrelFile) {
          return undefined
        }

        if (!barrelFile.exports) {
          barrelFile.exports = []
        }

        // true when we have a subdirectory that also contains barrel files
        const isSubExport = !!treeNode.parent?.data.path?.split?.('/')?.length

        if (isSubExport) {
          barrelFile.exports.push({
            name: [source.name],
            path: getRelativePath(treeNode.parent?.data.path, item.data.path),
            isTypeOnly: source.isTypeOnly,
          })
        } else {
          barrelFile.exports.push({
            name: [source.name],
            path: `./${item.data.file.baseName}`,
            isTypeOnly: source.isTypeOnly,
          })
        }

        barrelFile.sources.push({
          name: source.name,
          isTypeOnly: source.isTypeOnly,
          //TODO use parser to generate import
          value: '',
          isExportable: mode === 'all' || mode === 'named',
          isIndexable: mode === 'all' || mode === 'named',
        })
      })
    })

    if (previousBarrelFile) {
      previousBarrelFile.sources.push(...barrelFile.sources)
      previousBarrelFile.exports?.push(...(barrelFile.exports || []))
    } else {
      cachedFiles.set(barrelFile.path, barrelFile)
    }
  })

  if (mode === 'all') {
    return [...cachedFiles.values()].map((file) => {
      return {
        ...file,
        exports: file.exports?.map((exportItem) => {
          return {
            ...exportItem,
            name: undefined,
          }
        }),
      }
    })
  }

  return [...cachedFiles.values()]
}

export const barrelPlugin = createPlugin<Options, ExtendOptions>({
  name: 'barrel',
  install(app, options) {
    if (!options) {
      throw new Error('Barrel plugin requires options.root and options.mode')
    }

    if (!options.mode) {
      return undefined
    }

    app.context.events.onOnce('process:end', async ({ files }) => {
      const root = options.root
      // TODO check if we need meta here per file
      const barrelFiles = getBarrelFiles({ files, root, mode: options.mode })

      await app.context.fileManager.add(...barrelFiles)

      await app.context.fileManager.write({
        parsers: app.context.installedParsers,
      })
    })
  },
  inject(app) {
    return {
      async writeEntry({ root, mode }) {
        if (!mode) {
          return undefined
        }

        const rootPath = resolve(root, 'index.ts')

        const barrelFiles = app.files.filter((file) => {
          return file.sources.some((source) => source.isIndexable)
        })

        const rootFile: KubbFile.File = {
          path: rootPath,
          baseName: 'index.ts',
          exports: barrelFiles
            .flatMap((file) => {
              const containsOnlyTypes = file.sources.every((source) => source.isTypeOnly)

              return file.sources
                ?.map((source) => {
                  if (!file.path || !source.isIndexable) {
                    return undefined
                  }

                  return {
                    name: mode === 'all' ? undefined : [source.name],
                    path: getRelativePath(rootPath, file.path),
                    isTypeOnly: mode === 'all' ? containsOnlyTypes : source.isTypeOnly,
                  } as KubbFile.Export
                })
                .filter(Boolean)
            })
            .filter(Boolean),
          sources: [],
        }

        await app.context.fileManager.add(rootFile)
      },
    }
  },
})
