/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: not needed */

import path from 'node:path'
import { createFile } from '../createFile.ts'
import type * as KubbFile from '../KubbFile.ts'
import { getRelativePath } from '../utils/getRelativePath.ts'
import { TreeNode } from '../utils/TreeNode.ts'
import { definePlugin } from './definePlugin.ts'

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
  /**
   * `fabric.writeEntry` should be called before `fabric.write`
   */
  writeEntry(options: WriteEntryOptions): Promise<void>
}

declare global {
  namespace Kubb {
    interface Fabric {
      /**
       * `fabric.writeEntry` should be called before `fabric.write`
       */
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

  const indexableSourcesMap = new Map<KubbFile.File, Array<KubbFile.Source>>()

  for (const file of files) {
    const indexableSources: Array<KubbFile.Source> = []
    for (const source of file.sources || []) {
      if (source.isIndexable && source.name) {
        indexableSources.push(source)
      }
    }
    if (indexableSources.length > 0) {
      indexableSourcesMap.set(file, indexableSources)
    }
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
        imports: [],
        exports: [],
        sources: [],
      })
      cachedFiles.set(barrelPath, barrelFile)
      dedupe.set(barrelPath, new Set<string>())
    }

    const seen = dedupe.get(barrelPath)!

    for (const leaf of node.leaves) {
      const file = leaf.data.file
      if (!file || !file.path) {
        continue
      }

      const indexableSources = indexableSourcesMap.get(file)
      if (!indexableSources) {
        continue
      }

      for (const source of indexableSources) {
        const key = `${source.name}|${source.isTypeOnly ? '1' : '0'}`
        if (seen.has(key)) {
          continue
        }
        seen.add(key)

        // Always compute relative path from the parent directory to the file path
        barrelFile.exports!.push({
          name: [source.name!],
          path: getRelativePath(parentPath, file.path),
          isTypeOnly: source.isTypeOnly,
        })

        barrelFile!.sources.push({
          name: source.name!,
          isTypeOnly: source.isTypeOnly,
          value: '', // TODO use parser to generate import
          isExportable: mode === 'all' || mode === 'named',
          isIndexable: mode === 'all' || mode === 'named',
        })
      }
    }
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

export const barrelPlugin = definePlugin<Options, ExtendOptions>({
  name: 'barrel',
  install(ctx, options) {
    if (!options) {
      throw new Error('Barrel plugin requires options.root and options.mode')
    }

    if (!options.mode) {
      return undefined
    }

    ctx.on('files:writing:start', async (files) => {
      const root = options.root
      const barrelFiles = getBarrelFiles({ files, root, mode: options.mode })

      await ctx.fileManager.add(...barrelFiles)
    })
  },
  inject(ctx, options) {
    if (!options) {
      throw new Error('Barrel plugin requires options.root and options.mode')
    }

    return {
      async writeEntry({ root, mode }) {
        if (!mode || mode === 'propagate') {
          return undefined
        }

        const rootPath = path.resolve(root, 'index.ts')

        const barrelFiles: Array<KubbFile.ResolvedFile> = []
        for (const file of ctx.files) {
          for (const source of file.sources) {
            if (source.isIndexable) {
              barrelFiles.push(file)

              break
            }
          }
        }

        const fileTypeCache = new Map<KubbFile.ResolvedFile, boolean>()
        for (const file of barrelFiles) {
          fileTypeCache.set(
            file,
            file.sources.every((source) => source.isTypeOnly),
          )
        }

        const exports: Array<KubbFile.Export> = []
        for (const file of barrelFiles) {
          const containsOnlyTypes = fileTypeCache.get(file) ?? false

          for (const source of file.sources) {
            if (!file.path || !source.isIndexable) {
              continue
            }

            exports.push({
              name: mode === 'all' ? undefined : [source.name],
              path: getRelativePath(rootPath, file.path),
              isTypeOnly: mode === 'all' ? containsOnlyTypes : source.isTypeOnly,
            } as KubbFile.Export)
          }
        }

        const entryFile = createFile({
          path: rootPath,
          baseName: 'index.ts',
          imports: [],
          exports,
          sources: [],
        })

        await ctx.addFile(entryFile)

        await ctx.fileManager.write({
          mode: ctx.config.mode,
          dryRun: options.dryRun,
          parsers: ctx.installedParsers,
        })
      },
    }
  },
})
