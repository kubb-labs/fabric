import process from 'node:process'
import type { FileManager } from '@kubb/fabric-core'
import type { ReactNode } from 'react'
import { ConcurrentRoot } from 'react-reconciler/constants.js'
import { onExit } from 'signal-exit'
import { Root } from './components/Root.tsx'
import { createNode } from './dom.ts'
import type { FiberRoot } from './Renderer.ts'
import { Renderer } from './Renderer.ts'
import type { DOMElement } from './types.ts'
import { processFiles } from './utils/processFiles.ts'
import { squashTextNodes } from './utils/squashTextNodes.ts'

type Options = {
  fileManager: FileManager
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
  // Ignore last render after unmounting a tree to prevent empty output before exit
  #isUnmounted: boolean

  exitPromise?: Promise<void>
  readonly #container: FiberRoot
  readonly #rootNode: DOMElement

  constructor(options: Options) {
    this.#options = options

    this.#rootNode = createNode('kubb-root')
    this.#rootNode.onRender = this.onRender
    this.#rootNode.onImmediateRender = this.onRender

    // Ignore last render after unmounting a tree to prevent empty output before exit
    this.#isUnmounted = false
    this.unmount.bind(this)

    const originalError = console.error
    console.error = (data: string | Error) => {
      const message = typeof data === 'string' ? data : data?.message

      if (message?.match(/Encountered two children with the same key/gi)) {
        return
      }
      if (message?.match(/React will try to recreat/gi)) {
        return
      }
      if (message?.match(/Each child in a list should have a unique/gi)) {
        return
      }
      if (message?.match(/The above error occurred in the <KubbErrorBoundary/gi)) {
        return
      }

      if (message?.match(/A React Element from an older version of React was render/gi)) {
        return
      }

      originalError(data)
    }

    // Report when an error was detected in a previous render
    // https://github.com/pmndrs/react-three-fiber/pull/2261
    const logRecoverableError =
      typeof reportError === 'function'
        ? // In modern browsers, reportError will dispatch an error event,
          // emulating an uncaught JavaScript error.
          reportError
        : // In older browsers and test environments, fallback to console.error.
          console.error

    const rootTag = ConcurrentRoot
    const hydrationCallbacks = null
    const isStrictMode = false
    const concurrentUpdatesByDefaultOverride = false
    const identifierPrefix = 'id'
    const onUncaughtError = logRecoverableError
    const onCaughtError = logRecoverableError
    const onRecoverableError = logRecoverableError
    const transitionCallbacks = null

    this.#container = Renderer.createContainer(
      this.#rootNode,
      rootTag,
      hydrationCallbacks,
      isStrictMode,
      concurrentUpdatesByDefaultOverride,
      identifierPrefix,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      transitionCallbacks,
    )

    // Unmount when process exits
    this.unsubscribeExit = onExit(
      (code) => {
        this.unmount(code)
      },
      { alwaysLast: false },
    ).bind(this)

    Renderer.injectIntoDevTools({
      bundleType: 1, // 0 for PROD, 1 for DEV
      version: '19.1.0', // should be React version and not Kubb's custom version
      rendererPackageName: 'kubb', // package name
    })
  }

  get fileManager() {
    return this.#options.fileManager
  }

  #renderPromise: Promise<void> = Promise.resolve()
  #renderWaiters: Array<{ resolve: () => void; reject: (error: unknown) => void }> = []
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
          console.log('Rendering: \n')
          console.log(output)
        }

        if (this.#options?.stdout && process.env.NODE_ENV !== 'test') {
          this.#options.stdout.clearLine(0)
          this.#options.stdout.cursorTo(0)
          this.#options.stdout.write(output)
        }
      })

    const waiter = this.#renderWaiters.shift()

    this.#renderPromise = task
      .then(() => {
        waiter?.resolve()
      })
      .catch((error) => {
        waiter?.reject(error)
        this.onError(error as Error)
        throw error
      })

    return this.#renderPromise
  }
  onError(error: Error): void {
    if (process.env.NODE_ENV === 'test') {
      console.warn(error)
    }

    throw error
  }
  onExit(error?: Error): void {
    this.unmount(error)
  }

  async #getOutput(node: DOMElement): Promise<string> {
    const text = squashTextNodes(node)
    const files = this.fileManager.files

    return files.length
      ? [...files]
          .flatMap((file) => [...file.sources].map((item) => item.value))
          .filter(Boolean)
          .join('\n\n')
      : text
  }

  #waitForNextRender(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#renderWaiters.push({ resolve, reject: (error: unknown) => reject(error) })
    })
  }

  #rejectLatestRenderWaiter(error: unknown): void {
    const waiter = this.#renderWaiters.pop()
    if (waiter) {
      waiter.reject(error)
    }
  }

  async render(node: ReactNode): Promise<void> {
    const element = (
      <Root onExit={this.onExit.bind(this)} onError={this.onError.bind(this)}>
        {node}
      </Root>
    )

    const waitForRender = this.#waitForNextRender()

    try {
      Renderer.updateContainerSync(element, this.#container, null, null)
      Renderer.flushSyncWork()
    } catch (error) {
      this.#rejectLatestRenderWaiter(error)
      void waitForRender.catch(() => {})
      throw error
    }

    await waitForRender
  }

  async renderToString(node: ReactNode): Promise<string> {
    const element = (
      <Root onExit={this.onExit.bind(this)} onError={this.onError.bind(this)}>
        {node}
      </Root>
    )

    const waitForRender = this.#waitForNextRender()

    try {
      Renderer.updateContainerSync(element, this.#container, null, null)
      Renderer.flushSyncWork()
    } catch (error) {
      this.#rejectLatestRenderWaiter(error)
      void waitForRender.catch(() => {})
      throw error
    }

    await waitForRender

    this.fileManager.clear()

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
