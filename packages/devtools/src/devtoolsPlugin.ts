import type { AddressInfo } from 'node:net'
import { createPlugin } from '@kubb/fabric-core/plugins'
import type { FabricContext } from '@kubb/fabric-core/types'
import type { LoggerPluginState } from '@kubb/fabric-core/plugins'
import type { ViteDevServer } from 'vite'
import { startDevtoolsServer } from './server/startDevtoolsServer.ts'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 5175
const DEFAULT_LOGGER_URL = 'ws://127.0.0.1:7071/__fabric_logger__'

export interface DevtoolsPluginOptions {
  /**
   * Hostname to bind the Vite dev server to.
   * @default '127.0.0.1'
   */
  host?: string
  /**
   * Preferred port for the devtools UI. Falls back to any free port when unavailable.
   * @default 5175
   */
  port?: number
  /**
   * Automatically open the devtools UI in the default browser once ready.
   * @default false
   */
  open?: boolean
  /**
   * Custom WebSocket URL for the logger plugin feed.
   * Required when the logger plugin is not installed in the same process.
   */
  loggerUrl?: string
}

export interface DevtoolsPluginState {
  status: 'idle' | 'starting' | 'ready' | 'stopped' | 'error'
  host: string
  port: number
  url: string | null
  loggerUrl: string
  lastError?: {
    message: string
    stack?: string
  }
}

declare global {
  namespace Kubb {
    interface Fabric {
      devtools: DevtoolsPluginState
    }
  }
}

const DEVTOOLS_STATE = Symbol('devtools:state')

type ContextWithDevtoolsState = FabricContext & {
  [DEVTOOLS_STATE]?: DevtoolsPluginState
}

function createState(): DevtoolsPluginState {
  return {
    status: 'idle',
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    url: null,
    loggerUrl: DEFAULT_LOGGER_URL,
  }
}

function setState(context: FabricContext, state: DevtoolsPluginState): void {
  ;(context as ContextWithDevtoolsState)[DEVTOOLS_STATE] = state
  ;(context as any).devtools = state
}

function getState(context: FabricContext): DevtoolsPluginState | undefined {
  return (context as ContextWithDevtoolsState)[DEVTOOLS_STATE]
}

export const devtoolsPlugin = createPlugin<DevtoolsPluginOptions, { devtools: DevtoolsPluginState }>({
  name: 'devtools',
  inject(context, options) {
    const state = createState()

    if (options?.host) {
      state.host = options.host
    }
    if (typeof options?.port === 'number') {
      state.port = options.port
    }
    if (options?.loggerUrl) {
      state.loggerUrl = options.loggerUrl
    }

    setState(context, state)

    return {
      devtools: state,
    }
  },
  async install(context, options) {
    let state = getState(context)
    if (!state) {
      state = createState()
      setState(context, state)
    }

    const host = options?.host ?? state.host ?? DEFAULT_HOST
    const preferredPort = options?.port ?? state.port ?? DEFAULT_PORT
    const open = options?.open ?? false

    const loggerState = (context as { logger?: LoggerPluginState }).logger
    const loggerUrl = options?.loggerUrl ?? loggerState?.endpoint.url ?? state.loggerUrl

    if (!loggerUrl) {
      throw new Error(
        'devtoolsPlugin requires a logger URL. Install the loggerPlugin first or provide `loggerUrl` explicitly.',
      )
    }

    if (!loggerState && !options?.loggerUrl) {
      console.warn(
        '[fabric:devtools] Logger plugin not detected on the current Fabric instance. Using the provided logger URL.',
      )
    }

    state.host = host
    state.port = preferredPort
    state.loggerUrl = loggerUrl
    state.status = 'starting'
    state.url = null
    state.lastError = undefined

    let server: ViteDevServer | undefined

    try {
      server = await startDevtoolsServer({
        host,
        port: preferredPort,
        open,
        loggerUrl,
      })

      const address = server.httpServer?.address() as AddressInfo | null
      if (address?.port) {
        state.port = address.port
      }

      const resolvedUrl =
        server.resolvedUrls?.local?.[0] ??
        `http://${host}:${state.port}`

      state.url = resolvedUrl
      state.status = 'ready'

      if (loggerState && loggerState.status === 'error' && loggerState.lastError) {
        console.warn(
          '[fabric:devtools] Logger plugin reported an error:',
          loggerState.lastError.message,
        )
      }

      server.printUrls()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      state.status = 'error'
      state.lastError = {
        message: err.message,
        stack: err.stack,
      }
      console.error('[fabric:devtools] Failed to start devtools UI', err)
      throw err
    }

    if (!server) {
      return
    }

    context.onOnce('end', async () => {
      state!.status = 'stopped'
      state!.url = null
      await server!.close()
    })
  },
})
