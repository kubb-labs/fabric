import { describe, expect, test } from 'vitest'
import WebSocket, { type RawData } from 'ws'
import { defineFabric } from '../defineFabric.ts'
import type { LoggerEventMessage } from './loggerPlugin.ts'
import { loggerPlugin } from './loggerPlugin.ts'

describe('loggerPlugin', () => {
  test('broadcasts Fabric events over WebSocket', async () => {
    const fabric = defineFabric()()
    await fabric.use(loggerPlugin, {
      host: '127.0.0.1',
      port: 0,
      path: '/logger',
    })

    expect(fabric.logger.status).toBe('listening')
    expect(fabric.logger.endpoint.port).toBeGreaterThan(0)

      const client = new WebSocket(fabric.logger.endpoint.url)

      const eventPromise = new Promise<LoggerEventMessage>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timed out waiting for logger event'))
        }, 1_000)

        const cleanup = () => {
          clearTimeout(timeout)
          client.off('message', onMessage)
          client.off('error', onError)
          client.off('close', onClose)
        }

        const onMessage = (raw: RawData) => {
          const parsed = JSON.parse(String(raw))
          if (parsed.type === 'event') {
            cleanup()
            resolve(parsed as LoggerEventMessage)
          }
        }

        const onError = (error: Error) => {
          cleanup()
          reject(error)
        }

        const onClose = () => {
          cleanup()
          reject(new Error('Connection closed before receiving logger event'))
        }

        client.on('message', onMessage)
        client.once('error', onError)
        client.once('close', onClose)
      })

    await new Promise<void>((resolve) => client.once('open', () => resolve()))

    await fabric.context.emit('process:start', { files: [] as any })

    const eventMessage = await eventPromise

    expect(eventMessage.event).toBe('process:start')
    expect(Array.isArray(eventMessage.payload)).toBe(true)
    expect(fabric.logger.history.length).toBeGreaterThan(0)
    expect(fabric.logger.history.at(-1)?.event).toBe('process:start')

    await fabric.context.emit('end')
    await new Promise<void>((resolve) => client.once('close', () => resolve()))

    expect(fabric.logger.status).toBe('shutdown')
  })
})
