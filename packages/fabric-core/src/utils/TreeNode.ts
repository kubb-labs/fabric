import type * as KubbFile from '../KubbFile.ts'

type BarrelData = {
  file?: KubbFile.File
  path: string
  name: string
}

export type Graph = {
  nodes: Array<{ id: string; label: string }>
  edges: Array<{ from: string; to: string }>
}

export class TreeNode<TData = unknown> {
  data: TData
  parent?: TreeNode<TData>
  children: Array<TreeNode<TData>> = []
  #childrenMap = new Map<string, TreeNode<TData>>()
  #cachedLeaves?: Array<TreeNode<TData>>

  constructor(data: TData, parent?: TreeNode<TData>) {
    this.data = data
    this.parent = parent
  }

  addChild(data: TData): TreeNode<TData> {
    const child = new TreeNode(data, this)
    this.children.push(child)
    // Update Map if data has a name property (for BarrelData)
    if (typeof data === 'object' && data !== null && 'name' in data) {
      this.#childrenMap.set((data as { name: string }).name, child)
    }
    this.#cachedLeaves = undefined // invalidate cached leaves
    return child
  }

  getChildByName(name: string): TreeNode<TData> | undefined {
    return this.#childrenMap.get(name)
  }

  get leaves(): Array<TreeNode<TData>> {
    if (this.#cachedLeaves) return this.#cachedLeaves
    if (this.children.length === 0) return [this]

    const result: Array<TreeNode<TData>> = []
    const stack: Array<TreeNode<TData>> = [...this.children]
    const visited = new Set<TreeNode<TData>>()

    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) {
        continue
      }
      visited.add(node)

      if (node.children.length > 0) {
        stack.push(...node.children)
      } else {
        result.push(node)
      }
    }

    this.#cachedLeaves = result
    return result
  }

  forEach(callback: (node: TreeNode<TData>) => void): this {
    const stack: Array<TreeNode<TData>> = [this]

    for (let i = 0; i < stack.length; i++) {
      const node = stack[i]!
      callback(node)

      if (node.children.length > 0) {
        stack.push(...node.children)
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

  static toGraph(root: TreeNode<BarrelData>): Graph {
    const nodes: Array<{ id: string; label: string }> = []
    const edges: Array<{ from: string; to: string }> = []

    const stack: Array<TreeNode<BarrelData>> = [root]

    for (let i = 0; i < stack.length; i++) {
      const node = stack[i]!

      nodes.push({
        id: node.data.path,
        label: node.data.name,
      })

      const children = node.children
      if (children.length > 0) {
        for (let j = 0, len = children.length; j < len; j++) {
          const child = children[j]!
          edges.push({
            from: node.data.path,
            to: child.data.path,
          })
          stack.push(child)
        }
      }
    }

    return { nodes, edges }
  }

  static fromFiles(files: Array<KubbFile.File>, rootFolder = ''): TreeNode<BarrelData> | null {
    const normalizePath = (p: string): string => p.replace(/\\/g, '/')
    const normalizedRoot = normalizePath(rootFolder)
    const rootPrefix = normalizedRoot.endsWith('/') ? normalizedRoot : `${normalizedRoot}/`

    const normalizedPaths = new Map<KubbFile.File, string>()
    const filteredFiles: Array<KubbFile.File> = []
    for (const file of files) {
      const filePath = normalizedPaths.get(file) ?? normalizePath(file.path)
      normalizedPaths.set(file, filePath)
      if (!filePath.endsWith('.json') && (!rootFolder || filePath.startsWith(rootPrefix))) {
        filteredFiles.push(file)
      }
    }

    if (filteredFiles.length === 0) {
      return null
    }

    const treeNode = new TreeNode<BarrelData>({
      name: rootFolder || '',
      path: rootFolder || '',
      file: undefined,
    })

    for (const file of filteredFiles) {
      const filePath = normalizedPaths.get(file)!
      const relPath = filePath.slice(rootPrefix.length)
      const parts = relPath.split('/')

      let current = treeNode
      let currentPath = rootFolder

      for (const [index, part] of parts.entries()) {
        const isLast = index === parts.length - 1
        currentPath += (currentPath.endsWith('/') ? '' : '/') + part

        let next = current.getChildByName(part)

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
