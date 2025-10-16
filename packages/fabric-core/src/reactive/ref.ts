type WatchStopHandle = () => void

/**
 * A reactive reference holding a typed value.
 */
export type Ref<T> = {
  value: T
  watch?(fn: (val: T) => void): () => void
}
/**
 * Create a reactive reference with a typed value.
 * Similar to Vue's `ref`, but framework-free.
 */
export function ref<T = null>(initial: T = null as T): Ref<T> {
  let _value: T = initial
  const subscribers = new Set<(val: T) => void>()

  const notify = (val: T) =>
    subscribers.forEach((fn) => {
      fn(val)
    })

  return new Proxy(
    {} as {
      value: T
      watch(fn: (val: T) => void): WatchStopHandle
    },
    {
      get(_, key: string) {
        if (key === 'value') return _value
        if (key === 'watch')
          return (fn: (val: T) => void): WatchStopHandle => {
            subscribers.add(fn)
            fn(_value) // Optional: fire immediately
            return () => subscribers.delete(fn)
          }
        return undefined
      },
      set(_, key: string, newVal: any) {
        if (key === 'value') {
          if (newVal !== _value) {
            _value = newVal
            notify(_value)
          }
          return true
        }
        return false
      },
    },
  )
}
