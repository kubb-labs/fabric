import { computed, onMounted, onUnmounted, reactive } from 'vue'
import type {
  LoggerEventMessage,
  LoggerHistoryMessage,
  LoggerMessage,
  LoggerStatusMessage,
  LoggerWelcomeMessage,
} from '@kubb/fabric-core/plugins'

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

interface LoggerState {
  connection: ConnectionState
  events: LoggerEventMessage[]
  statuses: LoggerStatusMessage[]
  welcome: LoggerWelcomeMessage | null
  lastError: string | null
  connectedClients: number
  loggerUrl: string
}

type UseLoggerOptions = {
  historyLimit?: number
}

export function useLogger(initialUrl: string, options: UseLoggerOptions = {}) {
  const historyLimit = options.historyLimit ?? 500

  const state = reactive<LoggerState>({
    connection: 'connecting',
    events: [],
    statuses: [],
    welcome: null,
    lastError: null,
    connectedClients: 0,
    loggerUrl: initialUrl,
  })

  let socket: WebSocket | null = null

  const closeSocket = () => {
    if (!socket) {
      return
    }
    if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
      socket.close()
    }
    socket = null
  }

  const pushEvent = (event: LoggerEventMessage) => {
    state.events.push(event)
    if (state.events.length > historyLimit) {
      state.events.splice(0, state.events.length - historyLimit)
    }
  }

  const pushStatus = (message: LoggerStatusMessage) => {
    state.statuses.push(message)
    if (state.statuses.length > historyLimit) {
      state.statuses.splice(0, state.statuses.length - historyLimit)
    }
    state.connectedClients = message.details.clients

    if (message.status === 'error' && message.error) {
      state.connection = 'error'
      state.lastError = message.error.message
    }

    if (message.status === 'shutdown') {
      state.connection = 'disconnected'
    }
  }

  const applyHistory = (message: LoggerHistoryMessage) => {
    state.events.splice(0, state.events.length, ...message.events)
    if (state.events.length > historyLimit) {
      state.events.splice(0, state.events.length - historyLimit)
    }
  }

  const handleMessage = (message: LoggerMessage) => {
    switch (message.type) {
      case 'event':
        pushEvent(message)
        break
      case 'history':
        applyHistory(message)
        break
      case 'status':
        pushStatus(message)
        break
      case 'welcome':
        state.welcome = message
        state.loggerUrl = message.url
        break
    }
  }

  const connect = () => {
    closeSocket()
    state.connection = 'connecting'
    state.lastError = null

    socket = new WebSocket(state.loggerUrl || initialUrl)

    socket.addEventListener('open', () => {
      state.connection = 'connected'
    })

    socket.addEventListener('close', () => {
      state.connection = state.connection === 'error' ? 'error' : 'disconnected'
    })

    socket.addEventListener('error', () => {
      state.connection = 'error'
      state.lastError ||= 'Unable to communicate with the Fabric logger server.'
    })

    socket.addEventListener('message', (event) => {
      try {
        const parsed: LoggerMessage = JSON.parse(event.data)
        handleMessage(parsed)
      } catch (error) {
        console.error('[fabric-devtools] Failed to parse logger message', error)
      }
    })
  }

  const reconnect = () => {
    connect()
  }

  const clearEvents = () => {
    state.events.splice(0, state.events.length)
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    closeSocket()
  })

  return {
    events: computed(() => state.events),
    statuses: computed(() => state.statuses),
    connection: computed(() => state.connection),
    welcome: computed(() => state.welcome),
    lastError: computed(() => state.lastError),
    connectedClients: computed(() => state.connectedClients),
    loggerUrl: computed(() => state.loggerUrl),
    reconnect,
    clearEvents,
  }
}
