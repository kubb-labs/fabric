import { onExit } from 'signal-exit'
import { Root } from '../../components/Root.ts'
import type { ComponentNode } from '../../composables/useNodeTree.ts'
import type { FabricElement } from '../../Fabric.ts'
import type { FileManager } from '../../FileManager.ts'
import { TreeNode } from '../../utils/TreeNode.ts'

type Options = {
  fileManager: FileManager
  treeNode?: TreeNode<ComponentNode>
  debug?: boolean
}

export class Runtime {
  readonly #options: Options
  exitPromise?: Promise<void>

  constructor(options: Options) {
    this.#options = options

    // Unmount when process exits
    this.unsubscribeExit = onExit(
      (code) => {
        this.unmount(code)
      },
      { alwaysLast: false },
    ).bind(this)
  }

  get fileManager() {
    return this.#options.fileManager
  }

  #renderPromise: Promise<void> = Promise.resolve()
  resolveExitPromise: () => void = () => {}
  rejectExitPromise: (reason?: Error) => void = () => {}
  unsubscribeExit: () => void = () => {}

  onError(error: Error): void {
    throw error
  }

  onExit(error?: Error): void {
    setTimeout(() => {
      this.unmount(error)
    }, 0)
  }

  async render(node: FabricElement): Promise<string> {
    const treeNode = this.#options.treeNode || new TreeNode<ComponentNode>({ type: 'Root', props: {} })

    const props = {
      fileManager: this.fileManager,
      treeNode,
      onExit: this.onExit.bind(this),
      onError: this.onError.bind(this),
    }

    try {
      treeNode.data.props = props

      const element = Root({ ...props, children: node })

      await this.#renderPromise

      return element()?.toString() || ''
    } catch (e) {
      props.onError(e as Error)
      return ''
    }
  }

  unmount(error?: Error | number | null): void {
    if (this.#options?.debug) {
      console.log('Unmount', error)
    }

    this.unsubscribeExit()

    if (error instanceof Error) {
      this.rejectExitPromise(error)
      return
    }

    this.resolveExitPromise()
  }

  async waitUntilExit(): Promise<void> {
    if (!this.exitPromise) {
      this.exitPromise = new Promise((resolve, reject) => {
        this.resolveExitPromise = resolve
        this.rejectExitPromise = reject
      })
    }

    return this.exitPromise
  }
}
