import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { relative } from 'node:path'
import * as clack from '@clack/prompts'
import pc from 'picocolors'
import { WebSocket, WebSocketServer } from 'ws'
import type { FabricEvents } from '../Fabric.ts'
import type * as KubbFile from '../KubbFile.ts'
import { definePlugin } from './definePlugin.ts'

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

function normalizeAddress(address: AddressInfo): {
  host: string
  port: number
} {
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

const DEFAULT_PROGRESS_BAR_SIZE = 30

export const loggerPlugin = definePlugin<Options>({
  name: 'logger',
  install(ctx, options = {}) {
    const { websocket = true, progress = true } = options

    const state = {
      spinner: clack.spinner(),
      isSpinning: false,
      progressBar: undefined as ReturnType<typeof clack.progress> | undefined,
    }

    function formatPath(path: string) {
      return relative(process.cwd(), path)
    }

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

          clack.log.info(`${pc.blue('ℹ')} Logger websocket listening on ${url}`)
          broadcast('websocket:ready', { url })
        }
      })

      wss.on('connection', (socket) => {
        clack.log.info(`${pc.blue('ℹ')} Logger websocket client connected`)
        socket.send(
          JSON.stringify({
            event: 'welcome',
            payload: {
              message: 'Connected to Fabric log stream',
              timestamp: Date.now(),
            },
          }),
        )
      })

      wss.on('error', (error) => {
        clack.log.error(`${pc.red('✗')} Logger websocket error: ${error.message}`)
      })
    }

    ctx.on('lifecycle:start', async () => {
      clack.intro(`${pc.blue('Fabric')} ${pc.dim('Starting run')}`)
      broadcast('lifecycle:start', { timestamp: Date.now() })
    })

    ctx.on('lifecycle:render', async () => {
      clack.log.info(`${pc.blue('ℹ')} Rendering application graph`)
      broadcast('lifecycle:render', { timestamp: Date.now() })
    })

    ctx.on('files:added', async (files) => {
      if (!files.length) {
        return
      }

      clack.log.info(`${pc.blue('ℹ')} Queued ${pluralize('file', files.length)}`)
      broadcast('files:added', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('file:resolve:path', async (file) => {
      clack.log.step(`Resolving path for ${pc.dim(formatPath(file.path))}`)
      broadcast('file:resolve:path', { file: serializeFile(file) })
    })

    ctx.on('file:resolve:name', async (file) => {
      clack.log.step(`Resolving name for ${pc.dim(formatPath(file.path))}`)
      broadcast('file:resolve:name', { file: serializeFile(file) })
    })

    ctx.on('files:processing:start', async (files) => {
      clack.log.step(`Processing ${pc.green(pluralize('file', files.length))}`)
      broadcast('files:processing:start', {
        total: files.length,
        timestamp: Date.now(),
      })

      if (progress) {
        state.progressBar = clack.progress({
          style: 'block',
          max: files.length,
          size: DEFAULT_PROGRESS_BAR_SIZE,
        })
        state.progressBar.start(`Processing ${files.length} files`)
      }
    })

    ctx.on('file:processing:start', async (file, index, total) => {
      if (!state.progressBar) {
        clack.log.step(`Processing ${pc.dim(`[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      }

      broadcast('file:processing:start', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('file:processing:update', async ({ processed, total, percentage, file }) => {
      broadcast('file:processing:update', {
        processed,
        total,
        percentage,
        file: serializeFile(file),
      })

      if (state.progressBar) {
        // undefined = auto-increment by 1
        state.progressBar.advance(undefined, `Writing ${formatPath(file.path)}`)
      } else {
        const formattedPercentage = Number.isFinite(percentage) ? percentage.toFixed(1) : '0.0'
        clack.log.step(`Progress ${pc.green(`${formattedPercentage}%`)} ${pc.dim(`(${processed}/${total})`)} → ${formatPath(file.path)}`)
      }
    })

    ctx.on('file:processing:end', async (file, index, total) => {
      if (state.progressBar) {
        state.progressBar.message(`${pc.green('✓')} Finished ${pc.dim(`[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      } else {
        clack.log.success(`${pc.green('✓')} Finished ${pc.dim(`[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      }

      broadcast('file:processing:end', {
        index,
        total,
        file: serializeFile(file),
      })
    })

    ctx.on('files:writing:start', async (files) => {
      broadcast('files:writing:start', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('files:writing:end', async (files) => {
      broadcast('files:writing:end', {
        files: files.map(serializeFile),
      })
    })

    ctx.on('files:processing:end', async (files) => {
      if (state.progressBar) {
        state.progressBar.stop(`${pc.green('✓')} Processed ${pluralize('file', files.length)}`)
        state.progressBar = undefined
      } else {
        clack.log.success(`${pc.green('✓')} Processed ${pluralize('file', files.length)}`)
      }

      broadcast('files:processing:end', {
        total: files.length,
        timestamp: Date.now(),
      })
    })

    ctx.on('lifecycle:end', async () => {
      if (state.progressBar) {
        state.progressBar.stop()
        state.progressBar = undefined
      }

      clack.outro(`${pc.blue('Fabric')} ${pc.dim('completed')}`)

      broadcast('lifecycle:end', { timestamp: Date.now() })

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
        clack.log.info(`${pc.blue('ℹ')} Logger websocket closed`)
      }
    })
  },
})
