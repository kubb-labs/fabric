const SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP']

/**
 * Register a callback to run when the process exits (via exit event or common signals).
 * Returns an unsubscribe function.
 */
export function onProcessExit(callback: (code: number | null) => void): () => void {
  const exitHandler = (code: number) => callback(code)

  const signalHandlers = new Map<NodeJS.Signals, () => void>()

  for (const signal of SIGNALS) {
    const handler = () => {
      unsubscribe()
      try {
        callback(null)
      } finally {
        process.kill(process.pid, signal)
      }
    }
    signalHandlers.set(signal, handler)
    process.on(signal, handler)
  }

  process.on('exit', exitHandler)

  function unsubscribe() {
    process.removeListener('exit', exitHandler)
    for (const [signal, handler] of signalHandlers) {
      process.removeListener(signal, handler)
    }
  }

  return unsubscribe
}
