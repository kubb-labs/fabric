import { EventEmitter as NodeEventEmitter } from 'node:events'

export class AsyncEventEmitter<TEvents extends Record<string, any>> {
  constructor(maxListener = 100) {
    this.#emitter.setMaxListeners(maxListener)
  }
  #emitter = new NodeEventEmitter()

  async emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArgs: TEvents[TEventName]): Promise<void> {
    const listeners = this.#emitter.listeners(eventName) as Array<(...args: TEvents[TEventName]) => any>

    if (listeners.length === 0) {
      return undefined
    }

    await Promise.all(
      listeners.map(async (listener) => {
        try {
          return await listener(...eventArgs)
        } catch (err) {
          console.error(`Error in async listener for "${eventName}":`, err)
        }
      }),
    )
  }

  on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void {
    this.#emitter.on(eventName, handler as any)
  }

  off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void {
    this.#emitter.off(eventName, handler as any)
  }
  removeAll(): void {
    this.#emitter.removeAllListeners()
  }
}
