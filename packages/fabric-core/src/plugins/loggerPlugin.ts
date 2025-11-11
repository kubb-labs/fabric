import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import type { AddressInfo } from 'node:net'
import { WebSocketServer, type WebSocket } from 'ws'
import type { FabricContext, FabricEvents } from '../Fabric.ts'
import { createPlugin } from './createPlugin.ts'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 7071
const DEFAULT_PATH = '/__fabric_logger__'
const DEFAULT_HISTORY_LIMIT = 250

const fabricEventNames = [
  'start',
  'end',
  'process:start',
  'process:progress',
  'process:end',
  'file:add',
  'file:resolve:path',
  'file:resolve:name',
  'file:start',
  'file:end',
  'write:start',
  'write:end',
] as const satisfies ReadonlyArray<keyof FabricEvents>

type FabricEventName = (typeof fabricEventNames)[number]

export type LoggerPluginOptions = {
  host?: string
  port?: number
  path?: string
  historyLimit?: number
}

export type LoggerEventMessage = {
  type: 'event'
  id: string
  event: FabricEventName
  payload: unknown[]
  timestamp: string
}

export type LoggerStatusMessage = {
  type: 'status'
  status: 'listening' | 'client-connected' | 'client-disconnected' | 'shutdown' | 'error'
  timestamp: string
  details: {
    clients: number
    url: string
  }
  error?: {
    message: string
    stack?: string
  }
}

export type LoggerWelcomeMessage = {
  type: 'welcome'
  sessionId: string
  timestamp: string
  historySize: number
  url: string
}

export type LoggerHistoryMessage = {
  type: 'history'
  events: LoggerEventMessage[]
  timestamp: string
}

export type LoggerMessage = LoggerEventMessage | LoggerStatusMessage | LoggerWelcomeMessage | LoggerHistoryMessage

export interface LoggerPluginState {
  sessionId: string
  status: 'initializing' | 'listening' | 'error' | 'shutdown'
  clients: number
  historyLimit: number
  history: LoggerEventMessage[]
  endpoint: {
    host: string
    port: number
    path: string
    url: string
  }
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

type ResolvedLoggerPluginOptions = {
  host: string
  port: number
  path: string
  historyLimit: number
}

const LOGGER_STATE = Symbol('logger:state')

type ContextWithLoggerState = FabricContext & {
  [LOGGER_STATE]?: LoggerPluginState
}

function applyDefaults(options?: LoggerPluginOptions): ResolvedLoggerPluginOptions {
  return {
    host: options?.host ?? DEFAULT_HOST,
    port: options?.port ?? DEFAULT_PORT,
    path: options?.path ?? DEFAULT_PATH,
    historyLimit: options?.historyLimit ?? DEFAULT_HISTORY_LIMIT,
  }
}

function toWsUrl(host: string, port: number, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `ws://${host}:${port}${normalizedPath}`
}

function createLoggerState(resolved: ResolvedLoggerPluginOptions): LoggerPluginState {
  return {
    sessionId: randomUUID(),
    status: 'initializing',
    clients: 0,
    historyLimit: resolved.historyLimit,
    history: [],
    endpoint: {
      host: resolved.host,
      port: resolved.port,
      path: resolved.path,
      url: toWsUrl(resolved.host, resolved.port, resolved.path),
    },
  }
}

function setState(context: FabricContext, state: LoggerPluginState): void {
  ;(context as ContextWithLoggerState)[LOGGER_STATE] = state
  ;(context as any).logger = state
}

function getState(context: FabricContext): LoggerPluginState | undefined {
  return (context as ContextWithLoggerState)[LOGGER_STATE]
}

function appendHistory(state: LoggerPluginState, message: LoggerEventMessage): void {
  if (state.historyLimit <= 0) {
    state.history.splice(0, state.history.length)
    return
  }

  state.history.push(message)
  const overflow = state.history.length - state.historyLimit
  if (overflow > 0) {
    state.history.splice(0, overflow)
  }
}

function toSerializable(value: unknown, seen = new WeakSet<object>()): unknown {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'symbol') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'undefined') {
    return undefined
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }

  if (Buffer.isBuffer(value)) {
    return value.toString('base64')
  }

  if (value instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(value))
  }

  if (ArrayBuffer.isView(value)) {
    return Array.from(new Uint8Array(value.buffer))
  }

  if (value instanceof Set) {
    return Array.from(value, (entry) => toSerializable(entry, seen))
  }

  if (value instanceof Map) {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of value.entries()) {
      result[String(key)] = toSerializable(entry, seen)
    }
    return result
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toSerializable(entry, seen))
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]'
    }
    seen.add(value)
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      const serializable = toSerializable(entry, seen)
      if (serializable !== undefined) {
        result[key] = serializable
      }
    }
    seen.delete(value)
    return result
  }

  return value
}

function sendMessage(socket: WebSocket, message: LoggerMessage): void {
  if (socket.readyState !== WebSocket.OPEN) {
    return
  }

  try {
    socket.send(JSON.stringify(message))
  } catch (error) {
    console.error('[fabric:logger] Failed to send message', error)
  }
}

function broadcastMessage(server: WebSocketServer | undefined, message: LoggerMessage): void {
  if (!server) {
    return
  }

  const payload = JSON.stringify(message)
  for (const client of server.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}

function updateEndpoint(state: LoggerPluginState, port: number): void {
  state.endpoint.port = port
  state.endpoint.url = toWsUrl(state.endpoint.host, port, state.endpoint.path)
}

export const loggerPlugin = createPlugin<LoggerPluginOptions, { logger: LoggerPluginState }>({
  name: 'logger',
  inject(context, options) {
    const resolved = applyDefaults(options)
    const state = createLoggerState(resolved)
    setState(context, state)

    return {
      logger: state,
    }
  },
  async install(context, options) {
    const resolved = applyDefaults(options)
    let state = getState(context)

    if (!state) {
      state = createLoggerState(resolved)
      setState(context, state)
    } else {
      state.historyLimit = resolved.historyLimit
      state.endpoint.host = resolved.host
      state.endpoint.port = resolved.port
      state.endpoint.path = resolved.path
      state.endpoint.url = toWsUrl(resolved.host, resolved.port, resolved.path)
    }

    let server: WebSocketServer | undefined

    const makeStatusMessage = (status: LoggerStatusMessage['status'], error?: Error): LoggerStatusMessage => ({
      type: 'status',
      status,
      timestamp: new Date().toISOString(),
      details: {
        clients: state!.clients,
        url: state!.endpoint.url,
      },
      ...(error
        ? {
            error: {
              message: error.message,
              stack: error.stack,
            },
          }
        : {}),
    })

    const broadcastStatus = (status: LoggerStatusMessage['status'], error?: Error) => {
      const message = makeStatusMessage(status, error)
      broadcastMessage(server, message)
      if (status === 'error' && error) {
        state!.status = 'error'
        state!.lastError = {
          message: error.message,
          stack: error.stack,
        }
      }
    }

    try {
      server = new WebSocketServer({
        host: resolved.host,
        port: resolved.port,
        path: resolved.path,
      })

      await new Promise<void>((resolve, reject) => {
        server!.once('listening', resolve)
        server!.once('error', reject)
      })

      const address = server.address() as AddressInfo | null
      if (address) {
        updateEndpoint(state, address.port)
      }

      state.status = 'listening'
      state.clients = server.clients.size

      console.info(`[fabric:logger] Listening on ${state.endpoint.url}`)

      broadcastStatus('listening')

      const sendHistory = (socket: WebSocket) => {
        if (state.history.length === 0) {
          return
        }
        const message: LoggerHistoryMessage = {
          type: 'history',
          events: state.history,
          timestamp: new Date().toISOString(),
        }
        sendMessage(socket, message)
      }

      server.on('connection', (socket) => {
        state.clients = server?.clients.size ?? 0
        const welcome: LoggerWelcomeMessage = {
          type: 'welcome',
          sessionId: state.sessionId,
          timestamp: new Date().toISOString(),
          historySize: state.history.length,
          url: state.endpoint.url,
        }
        sendMessage(socket, welcome)
        sendHistory(socket)
        broadcastStatus('client-connected')

        socket.on('close', () => {
          state.clients = server?.clients.size ?? 0
          broadcastStatus('client-disconnected')
        })

        socket.on('error', (error) => {
          console.error('[fabric:logger] Client error', error)
        })
      })

      for (const eventName of fabricEventNames) {
        context.on(eventName, async (...args: any[]) => {
          const eventMessage: LoggerEventMessage = {
            type: 'event',
            id: randomUUID(),
            event: eventName,
            payload: args.map((arg) => toSerializable(arg)),
            timestamp: new Date().toISOString(),
          }
          appendHistory(state!, eventMessage)
          broadcastMessage(server, eventMessage)
        })
      }

      context.onOnce('end', async () => {
        if (state.status !== 'shutdown') {
          state.status = 'shutdown'
        }
        state.clients = 0
        broadcastStatus('shutdown')

        await new Promise<void>((resolve) => {
          if (!server) {
            resolve()
            return
          }
          server.close(() => {
            resolve()
          })
        })
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      state.status = 'error'
      state.lastError = {
        message: err.message,
        stack: err.stack,
      }
      broadcastStatus('error', err)
      console.error('[fabric:logger] Failed to start logger server', err)
      throw err
    }
  },
})
