import type * as KubbFile from './KubbFile.ts'

/**
 * FileCollector is used to collect files from components via context
 * instead of walking the DOM tree.
 */
export class FileCollector {
  #files: Array<KubbFile.File> = []

  /**
   * Add a file to the collector
   */
  add(file: KubbFile.File): void {
    this.#files.push(file)
  }

  /**
   * Get all collected files
   */
  getFiles(): Array<KubbFile.File> {
    return [...this.#files]
  }

  /**
   * Clear all collected files
   */
  clear(): void {
    this.#files = []
  }
}
