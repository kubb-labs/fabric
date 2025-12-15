import { EventEmitter as NodeEventEmitter } from 'node:events'
import type { FabricMode } from '../Fabric.ts'

type Options = {
  mode?: FabricMode
  maxListener?: number
}

/**
 * Helper type for inferring the Record type from TEvents if it's already a Record,
 * otherwise defaults to never (requiring explicit TEventsRecord parameter).
 */
type InferEventsRecord<TEvents> = TEvents extends Record<string, any[]> ? TEvents : never

/**
 * AsyncEventEmitter that supports both Vue-style callable interfaces and Record types.
 * 
 * @template TEvents - The event interface (Vue-style callable interface or Record type)
 * @template TEventsRecord - The Record type mapping event names to argument tuples.
 *                           Required when TEvents is a callable interface, automatically inferred when TEvents is already a Record.
 */
export class AsyncEventEmitter<TEvents, TEventsRecord extends Record<string, any[]> = InferEventsRecord<TEvents>> {
  constructor({ maxListener = 100, mode = 'sequential' }: Options = {}) {
    this.#emitter.setMaxListeners(maxListener)
    this.#mode = mode
  }

  #emitter = new NodeEventEmitter()
  #mode: FabricMode

  async emit<TEventName extends keyof TEventsRecord & string>(
    eventName: TEventName,
    ...eventArgs: TEventsRecord[TEventName]
  ): Promise<void> {
    const listeners = this.#emitter.listeners(eventName) as Array<(...args: TEventsRecord[TEventName]) => any>

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

  on<TEventName extends keyof TEventsRecord & string>(
    eventName: TEventName,
    handler: (...eventArg: TEventsRecord[TEventName]) => void,
  ): void {
    this.#emitter.on(eventName, handler as any)
  }

  onOnce<TEventName extends keyof TEventsRecord & string>(
    eventName: TEventName,
    handler: (...eventArgs: TEventsRecord[TEventName]) => void,
  ): void {
    const wrapper = (...args: TEventsRecord[TEventName]) => {
      this.off(eventName, wrapper)
      handler(...args)
    }
    this.on(eventName, wrapper)
  }

  off<TEventName extends keyof TEventsRecord & string>(
    eventName: TEventName,
    handler: (...eventArg: TEventsRecord[TEventName]) => void,
  ): void {
    this.#emitter.off(eventName, handler as any)
  }

  removeAll(): void {
    this.#emitter.removeAllListeners()
  }
}
