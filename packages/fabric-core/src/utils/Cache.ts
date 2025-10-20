export class Cache<T> {
  #buffer = new Map<string, T>()

  get(key: string): T | null {
    return this.#buffer.get(key) ?? null
  }

  set(key: string, value: T): void {
    this.#buffer.set(key, value)
  }

  delete(key: string): void {
    this.#buffer.delete(key)
  }

  clear(): void {
    this.#buffer.clear()
  }

  keys(): string[] {
    return [...this.#buffer.keys()]
  }

  values(): Array<T> {
    return [...this.#buffer.values()]
  }

  flush(): void {
    // No-op for base cache
  }
}
