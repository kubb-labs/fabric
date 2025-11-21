import { describe, expect, test } from 'vitest'
import { defineFabric } from '@kubb/fabric-core'
import { devtoolsPlugin } from './devtoolsPlugin.ts'

describe('devtoolsPlugin', () => {
  test('starts successfully with default logger URL when logger plugin is missing', async () => {
    const fabric = defineFabric()()

    // The plugin should start with the default logger URL
    const result = await fabric.use(devtoolsPlugin)

    // Should have devtools state
    expect(result.devtools).toBeDefined()
    expect(result.devtools.status).toBe('ready')
    expect(result.devtools.loggerUrl).toBe('ws://127.0.0.1:7071/__fabric_logger__')
    expect(result.devtools.url).toBeTruthy()

    // Cleanup: close the server
    await result.context.emit('end')
  })

  test('uses custom logger URL when provided', async () => {
    const fabric = defineFabric()()
    const customUrl = 'ws://localhost:8080/custom-logger'

    const result = await fabric.use(devtoolsPlugin, { loggerUrl: customUrl })

    expect(result.devtools).toBeDefined()
    expect(result.devtools.loggerUrl).toBe(customUrl)

    // Cleanup: close the server
    await result.context.emit('end')
  })
})
