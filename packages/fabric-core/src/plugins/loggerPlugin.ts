import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { relative } from 'node:path'
import { Presets, SingleBar } from 'cli-progress'
import { createConsola, type LogLevel } from 'consola'
import { WebSocket, WebSocketServer } from 'ws'
import type { FabricEvents } from '../Fabric.ts'
import type * as KubbFile from '../KubbFile.ts'
import { createPlugin } from './createPlugin.ts'

/**
 * WebSocket message types for the logger protocol
 */
export interface LoggerEventMessage {
  type: 'event'
  id: string
  event: string
  payload: unknown[]
  timestamp: string
}

export interface LoggerStatusMessage {
  type: 'status'
  status: 'starting' | 'ready' | 'error' | 'shutdown'
  timestamp: string
  details: {
    clients: number
  }
  error?: {
    message: string
    stack?: string
  }
}

export interface LoggerHistoryMessage {
  type: 'history'
  events: LoggerEventMessage[]
}

export interface LoggerWelcomeMessage {
  type: 'welcome'
  message: string
  url: string
  timestamp: string
}

export type LoggerMessage =
  | LoggerEventMessage
  | LoggerStatusMessage
  | LoggerHistoryMessage
  | LoggerWelcomeMessage

type Broadcast = <T = unknown>(event: keyof FabricEvents | string, payload: T) => void

type WebSocketOptions = {
  /**
   * Hostname to bind the websocket server to.
   * @default '127.0.0.1'
   */
  host?: string
  /**
   * Port to bind the websocket server to.
   * @default 0 (random available port)
   */
  port?: number
}

type Options = {
  /**
   * Explicit consola log level.
   */
  level?: LogLevel
  /**
   * Toggle progress bar output.
   * @default true
   */
  progress?: boolean
  /**
   * Toggle or configure the websocket broadcast server.
   * When `true`, a websocket server is started on an ephemeral port.
   * When `false`, websocket support is disabled.
   * When providing an object, the server uses the supplied host and port.
   * @default true
   */
  websocket?: boolean | WebSocketOptions
}

function normalizeAddress(address: AddressInfo): { host: string; port: number } {
  const host = address.address === '::' ? '127.0.0.1' : address.address

  return { host, port: address.port }
}

function serializeFile(file: KubbFile.File | KubbFile.ResolvedFile) {
  return {
    path: file.path,
    baseName: file.baseName,
    name: 'name' in file ? file.name : undefined,
    extname: 'extname' in file ? file.extname : undefined,
  }
}

function pluralize(word: string, count: number) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

const defaultTag = 'Fabric'

const createProgressBar = () =>
  new SingleBar(
    {
      format: '{bar} {percentage}% | {value}/{total} | {message}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: true,
    },
    Presets.shades_grey,
  )

export interface LoggerPluginState {
  status: 'idle' | 'starting' | 'ready' | 'error' | 'shutdown'
  endpoint: {
    host: string
    port: number
    url: string
  } | null
  connectedClients: number
  lastError?: {
    message: string
    stack?: string
  }
}

declare global {
  namespace Kubb {
    interface Fabric {
      logger: LoggerPluginState
    }
  }
}

const LOGGER_STATE = Symbol('logger:state')

type ContextWithLoggerState = {
  [LOGGER_STATE]?: LoggerPluginState
}

function createState(): LoggerPluginState {
  return {
    status: 'idle',
    endpoint: null,
    connectedClients: 0,
  }
}

function setState(ctx: any, state: LoggerPluginState): void {
  ;(ctx as ContextWithLoggerState)[LOGGER_STATE] = state
  ctx.logger = state
}

function getState(ctx: any): LoggerPluginState | undefined {
  return (ctx as ContextWithLoggerState)[LOGGER_STATE]
}

export const loggerPlugin = createPlugin<Options, { logger: LoggerPluginState }>({
  name: 'logger',
  inject(ctx) {
    const state = createState()
    setState(ctx, state)

    return {
      logger: state,
    }
  },
  install(ctx, options = {}) {
    const { level, websocket = true, progress = true } = options

    const logger = createConsola(level !== undefined ? { level } : {}).withTag(defaultTag)

    const progressBar = progress ? createProgressBar() : undefined

    let server: http.Server | undefined
    let wss: WebSocketServer | undefined
    const eventHistory: LoggerEventMessage[] = []
    const MAX_HISTORY = 500

    let state = getState(ctx)
    if (!state) {
      state = createState()
      setState(ctx, state)
    }

    const sendMessage = (client: WebSocket, message: LoggerMessage) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    }

    const broadcast = (message: LoggerMessage) => {
      if (!wss) {
        return
      }

      for (const client of wss.clients) {
        sendMessage(client, message)
      }
    }

    const broadcastEvent = (event: string, payload: unknown) => {
      const eventMessage: LoggerEventMessage = {
        type: 'event',
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        event,
        payload: Array.isArray(payload) ? payload : [payload],
        timestamp: new Date().toISOString(),
      }

      eventHistory.push(eventMessage)
      if (eventHistory.length > MAX_HISTORY) {
        eventHistory.shift()
      }

      broadcast(eventMessage)
    }

    const broadcastStatus = (status: LoggerStatusMessage['status'], error?: Error) => {
      const statusMessage: LoggerStatusMessage = {
        type: 'status',
        status,
        timestamp: new Date().toISOString(),
        details: {
          clients: wss?.clients.size ?? 0,
        },
        error: error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      }

      if (state) {
        state.status = status
        state.connectedClients = wss?.clients.size ?? 0
        if (error) {
          state.lastError = statusMessage.error
        }
      }

      broadcast(statusMessage)
    }

    if (websocket) {
      const { host = '127.0.0.1', port = 0 } = typeof websocket === 'boolean' ? {} : websocket

      server = http.createServer()
      wss = new WebSocketServer({ server, path: '/__fabric_logger__' })

      server.listen(port, host, () => {
        const addressInfo = server?.address()

        if (addressInfo && typeof addressInfo === 'object') {
          const { host: resolvedHost, port: resolvedPort } = normalizeAddress(addressInfo)
          const url = `ws://${resolvedHost}:${resolvedPort}/__fabric_logger__`

          if (state) {
            state.status = 'ready'
            state.endpoint = {
              host: resolvedHost,
              port: resolvedPort,
              url,
            }
          }

          logger.info(`Logger websocket listening on ${url}`)
          broadcastStatus('ready')
        }
      })

      wss.on('connection', (socket) => {
        logger.info('Logger websocket client connected')

        if (state) {
          state.connectedClients = wss?.clients.size ?? 0
        }

        const welcomeMessage: LoggerWelcomeMessage = {
          type: 'welcome',
          message: 'Connected to Fabric log stream',
          url: state?.endpoint?.url ?? '',
          timestamp: new Date().toISOString(),
        }

        sendMessage(socket, welcomeMessage)

        const historyMessage: LoggerHistoryMessage = {
          type: 'history',
          events: [...eventHistory],
        }

        sendMessage(socket, historyMessage)

        broadcastStatus('ready')
      })

      wss.on('error', (error) => {
        logger.error('Logger websocket error', error)
        broadcastStatus('error', error as Error)
      })

      if (state) {
        state.status = 'starting'
      }
    }

    const formatPath = (path: string) => relative(process.cwd(), path)

    ctx.on('start', async () => {
      logger.start('Starting Fabric run')
      broadcastEvent('start', { timestamp: Date.now() })
    })

    ctx.on('render', async () => {
      logger.info('Rendering application graph')
      broadcastEvent('render', { timestamp: Date.now() })
    })

    ctx.on('file:add', async ({ files }) => {
      if (!files.length) {
        return
      }

      logger.info(`Queued ${pluralize('file', files.length)}`)
      broadcastEvent('file:add', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('file:resolve:path', async ({ file }) => {
      logger.info(`Resolving path for ${formatPath(file.path)}`)
      broadcastEvent('file:resolve:path', { file: serializeFile(file) })
    })

    ctx.on('file:resolve:name', async ({ file }) => {
      logger.info(`Resolving name for ${formatPath(file.path)}`)
      broadcastEvent('file:resolve:name', { file: serializeFile(file) })
    })

    ctx.on('process:start', async ({ files }) => {
      logger.start(`Processing ${pluralize('file', files.length)}`)
      broadcastEvent('process:start', { total: files.length, timestamp: Date.now() })

      if (progressBar) {
        logger.pauseLogs()
        progressBar.start(files.length, 0, { message: 'Starting...' })
      }
    })

    ctx.on('file:start', async ({ file, index, total }) => {
      logger.info(`Processing [${index + 1}/${total}] ${formatPath(file.path)}`)
      broadcastEvent('file:start', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('process:progress', async ({ processed, total, percentage, file }) => {
      const formattedPercentage = Number.isFinite(percentage) ? percentage.toFixed(1) : '0.0'

      logger.info(`Progress ${formattedPercentage}% (${processed}/${total}) → ${formatPath(file.path)}`)
      broadcastEvent('process:progress', {
        processed,
        total,
        percentage,
        file: serializeFile(file),
      })

      if (progressBar) {
        progressBar.increment(1, { message: `Writing ${formatPath(file.path)}` })
      }
    })

    ctx.on('file:end', async ({ file, index, total }) => {
      logger.success(`Finished [${index + 1}/${total}] ${formatPath(file.path)}`)
      broadcastEvent('file:end', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('write:start', async ({ files }) => {
      logger.start(`Writing ${pluralize('file', files.length)} to disk`)
      broadcastEvent('write:start', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('write:end', async ({ files }) => {
      logger.success(`Written ${pluralize('file', files.length)} to disk`)
      broadcastEvent('write:end', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('process:end', async ({ files }) => {
      logger.success(`Processed ${pluralize('file', files.length)}`)
      broadcastEvent('process:end', { total: files.length, timestamp: Date.now() })

      if (progressBar) {
        progressBar.update(files.length, { message: 'Done ✅' })
        progressBar.stop()

        logger.resumeLogs()
      }
    })

    ctx.on('end', async () => {
      logger.success('Fabric run completed')
      broadcastEvent('end', { timestamp: Date.now() })

      if (progressBar) {
        progressBar.stop()
        logger.resumeLogs()
      }

      broadcastStatus('shutdown')

      const closures: Array<Promise<void>> = []

      if (wss) {
        const wsServer = wss

        closures.push(
          new Promise((resolve) => {
            for (const client of wsServer.clients) {
              client.close()
            }
            wsServer.close(() => resolve())
          }),
        )
      }

      if (server) {
        const httpServer = server

        closures.push(
          new Promise((resolve) => {
            httpServer.close(() => resolve())
          }),
        )
      }

      if (closures.length) {
        await Promise.allSettled(closures)
        logger.info('Logger websocket closed')
      }

      if (state) {
        state.status = 'shutdown'
        state.endpoint = null
      }
    })
  },
})
