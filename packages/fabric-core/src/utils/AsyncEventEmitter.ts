import { EventEmitter as NodeEventEmitter } from 'node:events'
import type { FabricMode } from '../Fabric.ts'

type Options = {
  mode?: FabricMode
  maxListener?: number
}

export class AsyncEventEmitter<TEvents extends Record<string, any>> {
  constructor({ maxListener = 100, mode = 'sequential' }: Options = {}) {
    this.#emitter.setMaxListeners(maxListener)
    this.#mode = mode
  }

  #emitter = new NodeEventEmitter()
  #mode: FabricMode

  async emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArgs: TEvents[TEventName]): Promise<void> {
    const listeners = this.#emitter.listeners(eventName) as Array<(...args: TEvents[TEventName]) => any>

    if (listeners.length === 0) {
      return
    }

    const errors: Error[] = []

    if (this.#mode === 'sequential') {
      // Run listeners one by one, in order
      for (const listener of listeners) {
        try {
          await listener(...eventArgs)
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err))
          errors.push(error)
        }
      }
    } else {
      // Run all listeners concurrently
      const promises = listeners.map(async (listener) => {
        try {
          await listener(...eventArgs)
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err))
          errors.push(error)
        }
      })
      await Promise.all(promises)
    }

    if (errors.length === 1) {
      throw errors[0]
    }

    if (errors.length > 1) {
      throw new AggregateError(errors, `Errors in async listeners for "${eventName}"`)
    }
  }

  on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void {
    this.#emitter.on(eventName, handler as any)
  }

  onOnce<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArgs: TEvents[TEventName]) => void): void {
    const wrapper = (...args: TEvents[TEventName]) => {
      this.off(eventName, wrapper)
      handler(...args)
    }
    this.on(eventName, wrapper)
  }

  off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void {
    this.#emitter.off(eventName, handler as any)
  }

  removeAll(): void {
    this.#emitter.removeAllListeners()
  }
}
