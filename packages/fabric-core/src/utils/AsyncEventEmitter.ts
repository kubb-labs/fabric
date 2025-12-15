import { EventEmitter as NodeEventEmitter } from 'node:events'
import type { FabricMode } from '../Fabric.ts'

type Options = {
  mode?: FabricMode
  maxListener?: number
}

/**
 * Extracts event map from a callable interface.
 * Converts Vue-style callable interface to a Record type for internal use.
 * 
 * Note: Currently supports up to 13 event overloads. If you need more events,
 * add additional type parameters following the same pattern.
 */
export type ExtractEventMap<T> = T extends {
  (e: infer E1): void
  (e: infer E2, payload: infer P2): void
  (e: infer E3, payload: infer P3): void
  (e: infer E4, payload: infer P4): void
  (e: infer E5, payload: infer P5): void
  (e: infer E6, payload: infer P6): void
  (e: infer E7, payload: infer P7): void
  (e: infer E8, payload: infer P8): void
  (e: infer E9, payload: infer P9): void
  (e: infer E10, payload: infer P10): void
  (e: infer E11, payload: infer P11): void
  (e: infer E12, payload: infer P12): void
  (e: infer E13, payload: infer P13): void
}
  ? (E1 extends string ? { [K in E1]: [] } : {}) &
      (E2 extends string ? { [K in E2]: [P2] } : {}) &
      (E3 extends string ? { [K in E3]: [P3] } : {}) &
      (E4 extends string ? { [K in E4]: [P4] } : {}) &
      (E5 extends string ? { [K in E5]: [P5] } : {}) &
      (E6 extends string ? { [K in E6]: [P6] } : {}) &
      (E7 extends string ? { [K in E7]: [P7] } : {}) &
      (E8 extends string ? { [K in E8]: [P8] } : {}) &
      (E9 extends string ? { [K in E9]: [P9] } : {}) &
      (E10 extends string ? { [K in E10]: [P10] } : {}) &
      (E11 extends string ? { [K in E11]: [P11] } : {}) &
      (E12 extends string ? { [K in E12]: [P12] } : {}) &
      (E13 extends string ? { [K in E13]: [P13] } : {})
  : T extends Record<string, any[]>
    ? T
    : never

/**
 * AsyncEventEmitter for handling asynchronous events.
 * Supports both sequential and parallel execution of event handlers.
 * 
 * @template TEvents - Vue-style callable interface or Record type mapping event names to their argument tuples.
 *                     Example: interface Events { (e: 'event:name', payload: { data: string }): void }
 */
export class AsyncEventEmitter<TEvents> {
  constructor({ maxListener = 100, mode = 'sequential' }: Options = {}) {
    this.#emitter.setMaxListeners(maxListener)
    this.#mode = mode
  }

  #emitter = new NodeEventEmitter()
  #mode: FabricMode

  async emit<TEventName extends keyof ExtractEventMap<TEvents> & string>(
    eventName: TEventName,
    ...eventArgs: ExtractEventMap<TEvents>[TEventName]
  ): Promise<void> {
    const listeners = this.#emitter.listeners(eventName) as Array<(...args: ExtractEventMap<TEvents>[TEventName]) => any>

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

  on<TEventName extends keyof ExtractEventMap<TEvents> & string>(
    eventName: TEventName,
    handler: (...eventArg: ExtractEventMap<TEvents>[TEventName]) => void,
  ): void {
    this.#emitter.on(eventName, handler as any)
  }

  onOnce<TEventName extends keyof ExtractEventMap<TEvents> & string>(
    eventName: TEventName,
    handler: (...eventArgs: ExtractEventMap<TEvents>[TEventName]) => void,
  ): void {
    const wrapper = (...args: ExtractEventMap<TEvents>[TEventName]) => {
      this.off(eventName, wrapper)
      handler(...args)
    }
    this.on(eventName, wrapper)
  }

  off<TEventName extends keyof ExtractEventMap<TEvents> & string>(
    eventName: TEventName,
    handler: (...eventArg: ExtractEventMap<TEvents>[TEventName]) => void,
  ): void {
    this.#emitter.off(eventName, handler as any)
  }

  removeAll(): void {
    this.#emitter.removeAllListeners()
  }
}
