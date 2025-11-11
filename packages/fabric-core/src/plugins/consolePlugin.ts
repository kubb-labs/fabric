import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { relative } from 'node:path'
import consola, { type LogLevel } from 'consola'
import { WebSocket, WebSocketServer } from 'ws'
import type { FabricEvents } from '../Fabric.ts'
import type * as KubbFile from '../KubbFile.ts'
import { createPlugin } from './createPlugin.ts'

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

export const consolePlugin = createPlugin<Options>({
  name: 'console',
  install(ctx, options = {}) {
    const { level, websocket = true } = options

    const logger = consola.create({ fancy: true, level }).withTag(defaultTag)

    let server: http.Server | undefined
    let wss: WebSocketServer | undefined

    const broadcast: Broadcast = (event, payload) => {
      if (!wss) {
        return
      }

      const message = JSON.stringify({ event, payload })

      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      }
    }

    if (websocket) {
      const { host = '127.0.0.1', port = 0 } = typeof websocket === 'boolean' ? {} : websocket

      server = http.createServer()
      wss = new WebSocketServer({ server })

      server.listen(port, host, () => {
        const addressInfo = server?.address()

        if (addressInfo && typeof addressInfo === 'object') {
          const { host: resolvedHost, port: resolvedPort } = normalizeAddress(addressInfo)
          const url = `ws://${resolvedHost}:${resolvedPort}`

          logger.info(`Console websocket listening on ${url}`)
          broadcast('websocket:ready', { url })
        }
      })

      wss.on('connection', socket => {
        logger.info('Console websocket client connected')
        socket.send(
          JSON.stringify({
            event: 'welcome',
            payload: {
              message: 'Connected to Fabric console stream',
              timestamp: Date.now(),
            },
          }),
        )
      })

      wss.on('error', error => {
        logger.error('Console websocket error', error)
      })
    }

    const formatPath = (path: string) => relative(process.cwd(), path)

    ctx.on('start', async () => {
      logger.start('Starting Fabric run')
      broadcast('start', { timestamp: Date.now() })
    })

    ctx.on('render', async () => {
      logger.info('Rendering application graph')
      broadcast('render', { timestamp: Date.now() })
    })

    ctx.on('file:add', async ({ files }) => {
      if (!files.length) {
        return
      }

      logger.info(`Queued ${pluralize('file', files.length)}`)
      broadcast('file:add', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('file:resolve:path', async ({ file }) => {
      logger.info(`Resolving path for ${formatPath(file.path)}`)
      broadcast('file:resolve:path', { file: serializeFile(file) })
    })

    ctx.on('file:resolve:name', async ({ file }) => {
      logger.info(`Resolving name for ${formatPath(file.path)}`)
      broadcast('file:resolve:name', { file: serializeFile(file) })
    })

    ctx.on('process:start', async ({ files }) => {
      logger.start(`Processing ${pluralize('file', files.length)}`)
      broadcast('process:start', { total: files.length, timestamp: Date.now() })
    })

    ctx.on('file:start', async ({ file, index, total }) => {
      logger.info(`Processing [${index + 1}/${total}] ${formatPath(file.path)}`)
      broadcast('file:start', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('process:progress', async ({ processed, total, percentage, file }) => {
      const formattedPercentage = Number.isFinite(percentage) ? percentage.toFixed(1) : '0.0'

      logger.info(`Progress ${formattedPercentage}% (${processed}/${total}) → ${formatPath(file.path)}`)
      broadcast('process:progress', {
        processed,
        total,
        percentage,
        file: serializeFile(file),
      })
    })

    ctx.on('file:end', async ({ file, index, total }) => {
      logger.success(`Finished [${index + 1}/${total}] ${formatPath(file.path)}`)
      broadcast('file:end', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('write:start', async ({ files }) => {
      logger.start(`Writing ${pluralize('file', files.length)} to disk`)
      broadcast('write:start', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('write:end', async ({ files }) => {
      logger.success(`Written ${pluralize('file', files.length)} to disk`)
      broadcast('write:end', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('process:end', async ({ files }) => {
      logger.success(`Processed ${pluralize('file', files.length)}`)
      broadcast('process:end', { total: files.length, timestamp: Date.now() })
    })

    ctx.on('end', async () => {
      logger.success('Fabric run completed')
      broadcast('end', { timestamp: Date.now() })

      const closures: Array<Promise<void>> = []

      if (wss) {
        const wsServer = wss

        closures.push(
          new Promise(resolve => {
            wsServer.clients.forEach(client => client.close())
            wsServer.close(() => resolve())
          }),
        )
      }

      if (server) {
        const httpServer = server

        closures.push(
          new Promise(resolve => {
            httpServer.close(() => resolve())
          }),
        )
      }

      if (closures.length) {
        await Promise.allSettled(closures)
        logger.info('Console websocket closed')
      }
    })
  },
})
