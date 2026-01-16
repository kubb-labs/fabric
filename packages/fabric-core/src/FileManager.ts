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

  #resolvePath(file: KubbFile.File): KubbFile.File {
    this.events.emit('file:resolve:path', file)

    return file
  }

  #resolveName(file: KubbFile.File): KubbFile.File {
    this.events.emit('file:resolve:name', file)

    return file
  }

  add(...files: Array<KubbFile.File>): Array<KubbFile.ResolvedFile> {
    const resolvedFiles: Array<KubbFile.ResolvedFile> = []

    const mergedFiles = new Map<string, KubbFile.File>()

    files.forEach((file) => {
      const existing = mergedFiles.get(file.path)
      if (existing) {
        mergedFiles.set(file.path, mergeFile(existing, file))
      } else {
        mergedFiles.set(file.path, file)
      }
    })

    for (let file of mergedFiles.values()) {
      file = this.#resolveName(file)
      file = this.#resolvePath(file)

      const resolvedFile = createFile(file)

      this.#cache.set(resolvedFile.path, resolvedFile)
      this.flush()

      resolvedFiles.push(resolvedFile)
    }

    this.events.emit('files:added', resolvedFiles)

    return resolvedFiles
  }

  upsert(...files: Array<KubbFile.File>): Array<KubbFile.ResolvedFile> {
    const resolvedFiles: Array<KubbFile.ResolvedFile> = []

    const mergedFiles = new Map<string, KubbFile.File>()

    files.forEach((file) => {
      const existing = mergedFiles.get(file.path)
      if (existing) {
        mergedFiles.set(file.path, mergeFile(existing, file))
      } else {
        mergedFiles.set(file.path, file)
      }
    })

    for (let file of mergedFiles.values()) {
      const existing = this.#cache.get(file.path)

      file = this.#resolveName(file)
      file = this.#resolvePath(file)

      const merged = existing ? mergeFile(existing, file) : file
      const resolvedFile = createFile(merged)

      this.#cache.set(resolvedFile.path, resolvedFile)
      this.flush()

      resolvedFiles.push(resolvedFile)
    }

    this.events.emit('files:added', resolvedFiles)

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
      return this.#filesCache
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

    return files
  }

  //TODO add test and check if write of FileManager contains the newly added file
  async write(options: ProcessFilesProps): Promise<KubbFile.ResolvedFile[]> {
    await this.events.emit('files:writing:start', this.files)

    const resolvedFiles = await this.processor.run(this.files, options)

    this.clear()

    await this.events.emit('files:writing:end', resolvedFiles)

    return resolvedFiles
  }
}
