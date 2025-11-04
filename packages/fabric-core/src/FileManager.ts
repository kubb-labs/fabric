import path from 'node:path'
import { orderBy } from 'natural-orderby'
import { createFile } from './createFile.ts'
import type { FabricEvents } from './Fabric.ts'
import { FileProcessor, type ProcessFilesProps } from './FileProcessor.ts'
import type * as KubbFile from './KubbFile.ts'
import { AsyncEventEmitter } from './utils/AsyncEventEmitter.ts'
import { Cache } from './utils/Cache.ts'
import { trimExtName } from './utils/trimExtName.ts'

function mergeFile<TMeta extends object = object>(a: KubbFile.File<TMeta>, b: KubbFile.File<TMeta>): KubbFile.File<TMeta> {
  return {
    ...a,
    sources: [...(a.sources || []), ...(b.sources || [])],
    imports: [...(a.imports || []), ...(b.imports || [])],
    exports: [...(a.exports || []), ...(b.exports || [])],
  }
}

type Options = {
  events?: AsyncEventEmitter<FabricEvents>
}

export class FileManager {
  #cache = new Cache<KubbFile.ResolvedFile>()
  #filesCache: Array<KubbFile.ResolvedFile> | null = null
  events: AsyncEventEmitter<FabricEvents>
  processor: FileProcessor

  constructor({ events = new AsyncEventEmitter<FabricEvents>() }: Options = {}) {
    this.processor = new FileProcessor({ events })

    this.events = events
    return this
  }

  async #resolveFileInput(file: KubbFile.File): Promise<KubbFile.File> {
    const draft: KubbFile.File = { ...file }

    const payload: {
      file: KubbFile.File
      value?: KubbFile.Path
      set(value: KubbFile.Path): void
    } = {
      file: draft,
      value: draft.path,
      set(value) {
        payload.value = value
      },
    }

    await this.events.emit('file:resolve:path', payload)

    const resolvedPath = payload.value ?? payload.file.path ?? file.path

    if (!resolvedPath) {
      throw new Error(`FileManager: Unable to resolve path for file ${draft.baseName ?? file.baseName ?? '<unknown>'}`)
    }

    payload.file.path = resolvedPath

    const originalBaseName = file.baseName
    const originalPathBaseName = path.basename(file.path)
    const resolvedPathBaseName = path.basename(resolvedPath)

    if (!payload.file.baseName) {
      payload.file.baseName = resolvedPathBaseName as KubbFile.BaseName
    } else if (
      originalBaseName === originalPathBaseName &&
      payload.file.baseName === originalBaseName &&
      resolvedPathBaseName !== originalBaseName
    ) {
      payload.file.baseName = resolvedPathBaseName as KubbFile.BaseName
    }

    return payload.file
  }

  async #resolveFileName(file: KubbFile.ResolvedFile): Promise<KubbFile.ResolvedFile> {
    const draft: KubbFile.ResolvedFile = { ...file }

    const payload: {
      file: KubbFile.ResolvedFile
      value?: string
      set(value: string): void
    } = {
      file: draft,
      value: draft.name,
      set(value) {
        payload.value = value
      },
    }

    await this.events.emit('file:resolve:name', payload)

    if (payload.value !== undefined) {
      payload.file.name = payload.value
    }

    return payload.file
  }

  async add(...files: Array<KubbFile.File>) {
    const resolvedFiles: Array<KubbFile.ResolvedFile> = []

    const bufferedFiles = new Map<KubbFile.Path, KubbFile.File>()
    const renamedPaths = new Map<KubbFile.Path, Set<KubbFile.Path>>()

    for (const file of files) {
      const resolved = await this.#resolveFileInput(file)

      if (file.path !== resolved.path) {
        const renamed = renamedPaths.get(resolved.path) ?? new Set<KubbFile.Path>()
        renamed.add(file.path)
        renamedPaths.set(resolved.path, renamed)
      }

      const existing = bufferedFiles.get(resolved.path)
      if (existing) {
        bufferedFiles.set(resolved.path, mergeFile(existing, resolved))
      } else {
        bufferedFiles.set(resolved.path, resolved)
      }
    }

    for (const [pathKey, file] of bufferedFiles.entries()) {
      const renamed = renamedPaths.get(pathKey)
      if (renamed) {
        for (const originalPath of renamed) {
          if (originalPath !== pathKey) {
            this.#cache.delete(originalPath)
          }
        }
      }

      const existing = this.#cache.get(pathKey)
      const merged = existing ? mergeFile(existing, file) : file
      const resolvedFile = await this.#resolveFileName(createFile(merged))

      this.#cache.set(resolvedFile.path, resolvedFile)
      this.flush()

      resolvedFiles.push(resolvedFile)
    }

    await this.events.emit('file:add', { files: resolvedFiles })

    return resolvedFiles
  }

  async set(files: Array<KubbFile.File>) {
    this.#cache.clear()
    this.#filesCache = null

    const bufferedFiles = new Map<KubbFile.Path, KubbFile.File>()

    for (const file of files) {
      const resolved = await this.#resolveFileInput(file)

      const existing = bufferedFiles.get(resolved.path)

      if (existing) {
        bufferedFiles.set(resolved.path, mergeFile(existing, resolved))
      } else {
        bufferedFiles.set(resolved.path, resolved)
      }
    }

    const resolvedFiles: Array<KubbFile.ResolvedFile> = []

    for (const file of bufferedFiles.values()) {
      const resolvedFile = await this.#resolveFileName(createFile(file))
      this.#cache.set(resolvedFile.path, resolvedFile)
      resolvedFiles.push(resolvedFile)
    }

    await this.events.emit('file:add', { files: resolvedFiles })

    return resolvedFiles
  }

  flush() {
    this.#filesCache = null
    this.#cache.flush()
  }

  getByPath(path: KubbFile.Path): KubbFile.ResolvedFile | null {
    return this.#cache.get(path)
  }

  deleteByPath(path: KubbFile.Path): void {
    this.#cache.delete(path)
    this.#filesCache = null
  }

  clear(): void {
    this.#cache.clear()
    this.#filesCache = null
  }

  get files(): Array<KubbFile.ResolvedFile> {
    if (this.#filesCache) {
      return [...this.#filesCache]
    }

    const cachedKeys = this.#cache.keys()

    // order by path length and if file is a barrel file
    const keys = orderBy(cachedKeys, [(v) => v.length, (v) => trimExtName(v).endsWith('index')])

    const files: Array<KubbFile.ResolvedFile> = []

    for (const key of keys) {
      const file = this.#cache.get(key)
      if (file) {
        files.push(file)
      }
    }

    this.#filesCache = files

    return [...files]
  }

  //TODO add test and check if write of FileManager contains the newly added file
  async write(options: ProcessFilesProps): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('write:start', { files: this.files })

    const resolvedFiles = await this.processor.run(this.files, options)

    this.clear()

    await this.events.emit('write:end', { files: resolvedFiles })

    return resolvedFiles
  }
}
