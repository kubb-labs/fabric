import { describe, expect, test } from 'vitest'
import { defineFabric } from '@kubb/fabric-core'
import { devtoolsPlugin } from './devtoolsPlugin.ts'

describe('devtoolsPlugin', () => {
  test('throws informative error when logger plugin is missing and no loggerUrl provided', async () => {
    const fabric = defineFabric()()

    await expect(fabric.use(devtoolsPlugin)).rejects.toThrow(
      /requires a logger URL/i,
    )
  })
})
