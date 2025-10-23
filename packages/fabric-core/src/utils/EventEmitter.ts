import { EventEmitter as NodeEventEmitter } from 'node:events'

export class EventEmitter<TEvents extends Record<string, any>> {
  constructor(maxListener = 100) {
    this.#emitter.setMaxListeners(maxListener)
  }
  #emitter = new NodeEventEmitter()

  emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): void {
    this.#emitter.emit(eventName, ...(eventArg as any))
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
