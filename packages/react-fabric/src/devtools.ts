import { execa } from 'execa'
import { onExit } from 'signal-exit'
import ws from 'ws'

import { Renderer } from './Renderer.ts'

declare global {
  var WebSocket: typeof WebSocket
  var self: any
  var window: any
  var isDevtoolsEnabled: any
}

let isOpen = false

export function openDevtools() {
  if (isOpen) {
    return undefined
  }
  // Set up global polyfills BEFORE importing react-devtools-core
  // This is required because react-devtools-core expects these to be available
  const customGlobal = global as any
  customGlobal.WebSocket ||= ws
  customGlobal.window ||= global
  customGlobal.self ||= global
  customGlobal.isDevtoolsEnabled = true

  // Filter out Kubb internal components from devtools for a cleaner view.
  // See https://github.com/facebook/react/blob/edf6eac8a181860fd8a2d076a43806f1237495a1/packages/react-devtools-shared/src/types.js#L24
  customGlobal.window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = [
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'Context.Provider',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'Root',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'ErrorBoundary',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'kubb-file',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'kubb-text',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'kubb-import',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'kubb-export',
      isEnabled: true,
      isValid: true,
    },
    {
      // ComponentFilterDisplayName
      type: 2,
      value: 'kubb-source',
      isEnabled: true,
      isValid: true,
    },
  ]

  // biome-ignore lint/suspicious/noTsIgnore: cannot find types
  // @ts-ignore
  import('react-devtools-core').then(async (devtools) => {
    console.info('Opening devtools')
    const controller = new AbortController()
    if (!isOpen) {
      execa({
        stdio: 'pipe',
        preferLocal: true,
        cancelSignal: controller.signal,
        gracefulCancel: true,
      })`npx react-devtools@6.1.5`
    }

    isOpen = true

    // Destructure the functions from the module
    const { initialize, connectToDevTools } = devtools?.default || devtools

    // Initialize DevTools BEFORE importing Renderer (which imports React)
    initialize()
    console.info('Initializing devtools')

    // Inject the renderer BEFORE connecting to DevTools
    // This ensures DevTools can properly discover the custom renderer
    Renderer.injectIntoDevTools({
      bundleType: 1,
      version: '19.2.3',
      rendererPackageName: 'kubb',
      // findFiberByHostInstance is required for DevTools to map elements to fibers
      findFiberByHostInstance: () => null,
    })

    console.info('Connecting devtools')

    try {
      connectToDevTools({
        host: 'localhost',
        port: 8097,
        useHttps: false,
        isAppActive: () => true,
      })
    } catch (e) {
      console.error(e)
      console.info('Error when connecting the devtools')
    }

    onExit(
      () => {
        console.info('Disconnecting devtools')
        controller.abort()
      },
      { alwaysLast: false },
    )
  })
}
