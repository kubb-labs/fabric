import type * as KubbFile from '../KubbFile.ts'

type BarrelData = {
  file?: KubbFile.File
  path: string
  name: string
}

export class TreeNode<TData = unknown> {
  data: TData
  parent?: TreeNode<TData>
  children: Array<TreeNode<TData>> = []
  #cachedLeaves?: Array<TreeNode<TData>>

  constructor(data: TData, parent?: TreeNode<TData>) {
    this.data = data
    this.parent = parent
  }

  addChild(data: TData): TreeNode<TData> {
    const child = new TreeNode(data, this)
    this.children.push(child)
    this.#cachedLeaves = undefined // invalidate cached leaves
    return child
  }

  get leaves(): Array<TreeNode<TData>> {
    if (this.#cachedLeaves) return this.#cachedLeaves
    if (this.children.length === 0) return [this]

    const stack: Array<TreeNode<TData>> = [...this.children]
    const result: Array<TreeNode<TData>> = []

    for (const node of stack) {
      if (node.children.length) {
        for (const child of node.children) stack.push(child)
      } else {
        result.push(node)
      }
    }

    this.#cachedLeaves = result
    return result
  }

  forEach(callback: (node: TreeNode<TData>) => void): this {
    const stack: Array<TreeNode<TData>> = [this]

    for (const node of stack) {
      callback(node)
      if (node.children.length) {
        for (const child of node.children) stack.push(child)
      }
    }
    return this
  }

  findDeep(predicate: (node: TreeNode<TData>) => boolean): TreeNode<TData> | undefined {
    for (const leaf of this.leaves) {
      if (predicate(leaf)) return leaf
    }
    return undefined
  }

  static fromFiles(files: Array<KubbFile.File>, rootFolder = ''): TreeNode<BarrelData> | null {
    const normalizePath = (p: string): string => p.replace(/\\/g, '/')
    const normalizedRoot = normalizePath(rootFolder)
    const rootPrefix = normalizedRoot.endsWith('/') ? normalizedRoot : `${normalizedRoot}/`

    const filteredFiles = files.filter((file) => {
      const filePath = normalizePath(file.path)
      return !filePath.endsWith('.json') && (!rootFolder || filePath.startsWith(rootPrefix))
    })

    if (filteredFiles.length === 0) {
      return null
    }

    const treeNode = new TreeNode<BarrelData>({
      name: rootFolder || '',
      path: rootFolder || '',
      file: undefined,
    })

    for (const file of filteredFiles) {
      const relPath = normalizePath(file.path).slice(rootPrefix.length)
      const parts = relPath.split('/')

      let current = treeNode
      let currentPath = rootFolder

      for (const [index, part] of parts.entries()) {
        const isLast = index === parts.length - 1
        currentPath += (currentPath.endsWith('/') ? '' : '/') + part

        let next: TreeNode<BarrelData> | undefined
        for (const child of current.children) {
          if ((child.data as BarrelData).name === part) {
            next = child
            break
          }
        }

        if (!next) {
          next = current.addChild({
            name: part,
            path: currentPath,
            file: isLast ? file : undefined,
          })
        }

        current = next
      }
    }

    return treeNode
  }
}
