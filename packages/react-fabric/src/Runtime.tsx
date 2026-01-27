import process from 'node:process'
import { type FileManager, TreeNode } from '@kubb/fabric-core'
import { ConcurrentRoot } from 'react-reconciler/constants.js'
import { onExit } from 'signal-exit'
import { Root } from './components/Root.tsx'
import { createNode } from './dom.ts'
import type { FiberRoot } from './Renderer.ts'
import { Renderer } from './Renderer.ts'
import type { ComponentNode, DOMElement, FabricReactElement } from './types.ts'
import { processFiles } from './utils/processFiles.ts'
import { squashTextNodes } from './utils/squashTextNodes.ts'

type Options = {
  fileManager: FileManager
  treeNode?: TreeNode<ComponentNode>
  stdout?: NodeJS.WriteStream
  stdin?: NodeJS.ReadStream
  stderr?: NodeJS.WriteStream
  /**
   * Set this to true to always see the result of the render in the console(line per render)
   */
  debug?: boolean
}

export class Runtime {
  readonly #options: Options
  #isUnmounted: boolean
  #renderError?: Error

  exitPromise?: Promise<void>
  readonly #container: FiberRoot
  readonly #rootNode: DOMElement

  constructor(options: Options) {
    this.#options = options
    this.#rootNode = createNode('kubb-root')
    this.#rootNode.onRender = this.onRender
    this.#rootNode.onImmediateRender = this.onRender
    this.#isUnmounted = false
    this.unmount.bind(this)

    // Intercept noisy React errors
    console.error = (data: string | Error) => {
      const message = typeof data === 'string' ? data : data?.message
      if (
        message?.match(/Encountered two children with the same key/gi) ||
        message?.match(/React will try to recreat/gi) ||
        message?.match(/Each child in a list should have a unique/gi) ||
        message?.match(/The above error occurred in the <KubbErrorBoundary/gi) ||
        message?.match(/A React Element from an older version of React was render/gi)
      ) {
        return
      }
      console.log(data)
    }

    const logRecoverableError = typeof reportError === 'function' ? reportError : console.error

    const rootTag = ConcurrentRoot
    this.#container = Renderer.createContainer(
      this.#rootNode,
      rootTag,
      null,
      false,
      false,
      'id',
      logRecoverableError,
      logRecoverableError,
      logRecoverableError,
      null,
    )

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

  onRender: () => Promise<void> = () => {
    const previous = this.#renderPromise

    const task = previous
      .catch(() => {})
      .then(async () => {
        if (this.#isUnmounted) {
          return
        }

        const files = await processFiles(this.#rootNode)

        await this.fileManager.add(...files)

        if (!this.#options?.debug && !this.#options?.stdout) {
          return
        }

        const output = await this.#getOutput(this.#rootNode)

        if (this.#options?.debug) {
          console.log('Rendering:\n')
          console.log(output)
        }

        if (this.#options?.stdout && process.env.NODE_ENV !== 'test') {
          this.#options.stdout.clearLine(0)
          this.#options.stdout.cursorTo(0)
          this.#options.stdout.write(output)
        }
      })

    this.#renderPromise = task.catch((error) => {
      this.onError(error as Error)
    })

    return this.#renderPromise
  }

  onError(error: Error): void {
    // Store the error to be thrown after render completes
    this.#renderError = error
  }

  onExit(error?: Error): void {
    setTimeout(() => {
      this.unmount(error)
    }, 0)
  }

  async #getOutput(node: DOMElement): Promise<string> {
    const text = squashTextNodes(node)
    const files = this.fileManager.files

    if (!files.length) {
      return text
    }

    const values = new Set<string>()
    for (const file of files) {
      for (const source of file.sources) {
        if (source?.value) {
          values.add(source.value)
        }
      }
    }

    return [...values].join('\n\n')
  }

  async render(node: FabricReactElement): Promise<void> {
    const treeNode = this.#options.treeNode || new TreeNode<ComponentNode>({ type: 'Root', props: {} })
    const props = {
      fileManager: this.fileManager,
      treeNode,
      onExit: this.onExit.bind(this),
      onError: this.onError.bind(this),
    }
    treeNode.data.props = props

    const element = <Root {...props}>{node}</Root>

    Renderer.updateContainerSync(element, this.#container, null, null)
    Renderer.flushSyncWork()
    await this.#renderPromise

    // Throw any errors that occurred during rendering
    if (this.#renderError) {
      const error = this.#renderError
      this.#renderError = undefined
      throw error
    }
  }

  async renderToString(node: FabricReactElement): Promise<string> {
    const treeNode = this.#options.treeNode || new TreeNode<ComponentNode>({ type: 'Root', props: {} })
    const props = {
      fileManager: this.fileManager,
      treeNode,
      onExit: this.onExit.bind(this),
      onError: this.onError.bind(this),
    }
    treeNode.data.props = props

    const element = <Root {...props}>{node}</Root>

    Renderer.updateContainerSync(element, this.#container, null, null)
    Renderer.flushSyncWork()

    await this.#renderPromise
    this.fileManager.clear()

    // Throw any errors that occurred during rendering
    if (this.#renderError) {
      const error = this.#renderError
      this.#renderError = undefined
      throw error
    }

    return this.#getOutput(this.#rootNode)
  }

  unmount(error?: Error | number | null): void {
    if (this.#isUnmounted) {
      return
    }

    if (this.#options?.debug) {
      console.log('Unmount', error)
    }

    this.onRender()
    this.unsubscribeExit()

    this.#isUnmounted = true

    Renderer.updateContainerSync(null, this.#container, null, null)

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
