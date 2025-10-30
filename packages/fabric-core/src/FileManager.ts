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
  events: AsyncEventEmitter<FabricEvents>
  processor: FileProcessor

  constructor({ events = new AsyncEventEmitter<FabricEvents>() }: Options = {}) {
    this.processor = new FileProcessor({ events })

    this.events = events
    return this
  }

  async add(...files: Array<KubbFile.File>) {
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

    for (const file of mergedFiles.values()) {
      const existing = this.#cache.get(file.path)

      const merged = existing ? mergeFile(existing, file) : file
      const resolvedFile = createFile(merged)

      this.#cache.set(resolvedFile.path, resolvedFile)
      this.flush()

      resolvedFiles.push(resolvedFile)
    }

    await this.events.emit('file:add', { files: resolvedFiles })

    return resolvedFiles
  }

  flush() {
    this.#cache.flush()
  }

  getByPath(path: KubbFile.Path): KubbFile.ResolvedFile | null {
    return this.#cache.get(path)
  }

  deleteByPath(path: KubbFile.Path): void {
    this.#cache.delete(path)
  }

  clear(): void {
    this.#cache.clear()
  }

  get files(): Array<KubbFile.ResolvedFile> {
    const cachedKeys = this.#cache.keys()

    // order by path length and if file is a barrel file
    const keys = orderBy(cachedKeys, [(v) => v.length, (v) => trimExtName(v).endsWith('index')])

    const files = keys.map((key) => this.#cache.get(key))

    return files.filter(Boolean)
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
