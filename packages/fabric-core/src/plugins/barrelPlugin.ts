/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: not needed */

import { createPlugin } from './createPlugin.ts'
import type * as KubbFile from '../KubbFile.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import path from 'node:path'
import { getRelativePath } from '../utils/getRelativePath.ts'
import { createFile } from '../createFile.ts'

type Mode = 'all' | 'named' | 'propagate' | false

type Options = {
  root: string
  mode: Mode
  dryRun?: boolean
}

type WriteEntryOptions = {
  root: string
  mode: Mode
}

type ExtendOptions = {
  writeEntry(options: WriteEntryOptions): Promise<void>
}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface App {
    writeEntry(options: WriteEntryOptions): Promise<void>
  }
}

declare global {
  namespace Kubb {
    interface App {
      writeEntry(options: WriteEntryOptions): Promise<void>
    }
  }
}

type GetBarrelFilesOptions = {
  files: KubbFile.File[]
  root: string
  mode: Mode
}

export function getBarrelFiles({ files, root, mode }: GetBarrelFilesOptions): Array<KubbFile.File> {
  // Do not generate when propagating or disabled
  if (mode === 'propagate' || mode === false) {
    return []
  }

  const cachedFiles = new Map<KubbFile.Path, KubbFile.File>()
  const dedupe = new Map<KubbFile.Path, Set<string>>()

  const treeNode = TreeNode.fromFiles(files, root)

  if (!treeNode) {
    return []
  }

  treeNode.forEach((node) => {
    // Only create a barrel for directory-like nodes that have a parent with a path
    if (!node?.children || !node.parent?.data.path) {
      return
    }

    const parentPath = node.parent.data.path as KubbFile.Path
    const barrelPath = path.join(parentPath, 'index.ts') as KubbFile.Path

    let barrelFile = cachedFiles.get(barrelPath)
    if (!barrelFile) {
      barrelFile = createFile({
        path: barrelPath,
        baseName: 'index.ts',
        exports: [],
        sources: [],
      })
      cachedFiles.set(barrelPath, barrelFile)
      dedupe.set(barrelPath, new Set<string>())
    }

    const seen = dedupe.get(barrelPath)!

    // Collect all leaves under the current directory node
    node.leaves.forEach((leaf) => {
      const file = leaf.data.file
      if (!file) {
        return
      }

      const sources = file.sources || []
      sources.forEach((source) => {
        if (!file.path || !source.isIndexable || !source.name) {
          return
        }

        const key = `${source.name}|${source.isTypeOnly ? '1' : '0'}`
        if (seen.has(key)) {
          return
        }
        seen.add(key)

        // Always compute relative path from the parent directory to the file path
        barrelFile!.exports!.push({
          name: [source.name],
          path: getRelativePath(parentPath, file.path),
          isTypeOnly: source.isTypeOnly,
        })

        barrelFile!.sources.push({
          name: source.name,
          isTypeOnly: source.isTypeOnly,
          value: '', // TODO use parser to generate import
          isExportable: mode === 'all' || mode === 'named',
          isIndexable: mode === 'all' || mode === 'named',
        })
      })
    })
  })

  const result = [...cachedFiles.values()]

  if (mode === 'all') {
    return result.map((file) => ({
      ...file,
      exports: file.exports?.map((e) => ({ ...e, name: undefined })),
    }))
  }

  return result
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

    app.context.events.on('write:start', async ({ files }) => {
      const root = options.root
      const barrelFiles = getBarrelFiles({ files, root, mode: options.mode })

      await app.context.fileManager.add(...barrelFiles)
    })
  },
  inject(app, options) {
    if (!options) {
      throw new Error('Barrel plugin requires options.root and options.mode')
    }

    return {
      async writeEntry({ root, mode }) {
        if (!mode || mode === 'propagate') {
          return undefined
        }

        const rootPath = path.resolve(root, 'index.ts')

        const barrelFiles = app.files.filter((file) => {
          return file.sources.some((source) => source.isIndexable)
        })

        const entryFile = createFile({
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
        })

        await app.context.fileManager.add(entryFile)

        await app.context.fileManager.write({
          mode: app.context.options?.mode,
          dryRun: options.dryRun,
          parsers: app.context.installedParsers,
        })
      },
    }
  },
})
