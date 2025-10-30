import { execa } from 'execa'
import { onExit } from 'signal-exit'
import ws from 'ws'

declare global {
  var WebSocket: typeof WebSocket
  var self: any
  var window: any
  var isDevtoolsEnabled: any
}

export function open() {
  // biome-ignore lint/suspicious/noTsIgnore: cannot find types
  // @ts-ignore
  import('react-devtools-core').then((devtools) => {
    // Filter out Kubbs's internal components from devtools for a cleaner view.
    // See https://github.com/facebook/react/blob/edf6eac8a181860fd8a2d076a43806f1237495a1/packages/react-devtools-shared/src/types.js#L24
    const customGlobal = global as any
    customGlobal.WebSocket ||= ws
    customGlobal.window ||= global
    customGlobal.self ||= global
    customGlobal.isDevtoolsEnabled = true
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
        value: 'KubbRoot',
        isEnabled: true,
        isValid: true,
      },
      {
        // ComponentFilterDisplayName
        type: 2,
        value: 'KubbErrorBoundary',
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

    console.info('Opening devtools')
    const controller = new AbortController()
    execa({
      stdio: 'pipe',
      preferLocal: true,
      cancelSignal: controller.signal,
      gracefulCancel: true,
    })`npx react-devtools`

    ;(devtools as any).initialize()
    console.info('Connecting devtools')

    try {
      ;(devtools as any).connectToDevTools({
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
