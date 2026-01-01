import { createFabric, createRefKey } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin, refKeyPlugin } from '@kubb/fabric-core/plugins'

/**
 * Example demonstrating RefKey usage with multiple exports from the same file
 * This shows how the refKeyPlugin automatically groups imports from the same source
 */

export const fabric = createFabric()

// Create multiple refkeys for symbols from the same file
const API_URLRef = createRefKey('API_URL')
const API_TIMEOUTRef = createRefKey('API_TIMEOUT')
const API_RETRIESRef = createRefKey('API_RETRIES')

// Enable the refKey plugin for automatic import management
fabric.use(refKeyPlugin)

// Define multiple constants in config.ts with refkeys
fabric.addFile({
  baseName: 'config.ts',
  path: './example7/gen/config.ts',
  sources: [
    {
      name: 'API_URL',
      value: 'export const API_URL = "https://api.example.com"',
      isExportable: true,
      isIndexable: true,
      refkey: API_URLRef.resolve('API_URL', './example7/gen/config.ts'),
    },
    {
      name: 'API_TIMEOUT',
      value: 'export const API_TIMEOUT = 5000',
      isExportable: true,
      isIndexable: true,
      refkey: API_TIMEOUTRef.resolve('API_TIMEOUT', './example7/gen/config.ts'),
    },
    {
      name: 'API_RETRIES',
      value: 'export const API_RETRIES = 3',
      isExportable: true,
      isIndexable: true,
      refkey: API_RETRIESRef.resolve('API_RETRIES', './example7/gen/config.ts'),
    },
  ],
  imports: [],
  exports: [],
})

// Use multiple symbols from config.ts in client.ts
// The refKeyPlugin will automatically create a single import statement:
// import { API_URL, API_TIMEOUT, API_RETRIES } from './config'
fabric.addFile({
  baseName: 'client.ts',
  path: './example7/gen/client.ts',
  sources: [
    {
      name: 'createClient',
      value: `export function createClient() {
  return {
    url: API_URL,
    timeout: API_TIMEOUT,
    retries: API_RETRIES,
  }
}`,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

// Use only some of the symbols in another file
fabric.addFile({
  baseName: 'utils.ts',
  path: './example7/gen/utils.ts',
  sources: [
    {
      name: 'logConfig',
      value: `export function logConfig() {
  console.log('API URL:', API_URL)
  console.log('Timeout:', API_TIMEOUT)
}`,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [],
  exports: [],
})

fabric.use(fsPlugin, { clean: { path: './example7/gen' } })
fabric.use(typescriptParser)

fabric.write()
