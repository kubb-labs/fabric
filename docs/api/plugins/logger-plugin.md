---
layout: doc
title: loggerPlugin
outline: deep
---

# loggerPlugin

Streams Fabric lifecycle activity with beautiful CLI output, progress bars, and websocket support for custom tooling.

## Installation

The `loggerPlugin` is included in `@kubb/fabric-core`:

```ts [import.ts]
import { loggerPlugin } from '@kubb/fabric-core/plugins'
```

## Usage

```ts [basic-usage.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
  websocket: true,
})
```

## Options

### progress

Enables or disables the integrated CLI progress bar powered by `@clack/prompts`.

> [!TIP]
> The progress bar provides real-time visual feedback during file generation.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `true`    |

**Example:**

```ts [progress.ts]
fabric.use(loggerPlugin, {
  progress: true, // Show progress bar
})
```

### websocket

Toggles or configures the websocket server that broadcasts Fabric events for dashboards and GUIs.

|           |                                                  |
|----------:|:-------------------------------------------------|
|     Type: | `boolean \| { host?: string; port?: number }`   |
| Required: | `false`                                          |
|  Default: | `true`                                           |

**Example:**

```ts [websocket.ts]
// Enable with default settings
fabric.use(loggerPlugin, {
  websocket: true,
})

// Custom host and port
fabric.use(loggerPlugin, {
  websocket: {
    host: 'localhost',
    port: 3000,
  },
})

// Disable websocket
fabric.use(loggerPlugin, {
  websocket: false,
})
```

## Features

### CLI Progress Bar

Displays a beautiful progress bar with colored output and symbols using `@clack/prompts`:

```ts [progress-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
})

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true },
  ],
})

await fabric.write()
// Displays progress bar during generation
```

### Websocket Broadcasting

Broadcasts Fabric events to connected clients for building custom dashboards:

```ts [websocket-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
  websocket: {
    port: 3000,
  },
})

// Websocket server starts on port 3000
// Clients can connect to ws://localhost:3000
```

### Event Logging

Logs every key lifecycle event with colored output:

- `lifecycle:start` — Generation started
- `file:processing:start` — File processing started
- `file:processing:update` — Progress update
- `file:processing:end` — File completed
- `files:writing:start` — Writing files
- `files:writing:end` — Files written
- `lifecycle:end` — Generation completed

## Examples

### Basic Logging

```ts [basic-logging.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Add logger first to capture all events
fabric.use(loggerPlugin, {
  progress: true,
})

fabric.use(fsPlugin, {
  clean: { path: './output' },
})

fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  sources: [
    { value: 'export const API_URL = "https://api.example.com"', isExportable: true },
  ],
})

await fabric.write()
```

### Disable Progress in CI

```ts [ci-config.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

const isCI = process.env.CI === 'true'

fabric.use(loggerPlugin, {
  progress: !isCI, // Disable progress bar in CI
  websocket: false, // Disable websocket in CI
})
```

### Custom Websocket Port

```ts [custom-port.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
  websocket: {
    host: '0.0.0.0',
    port: 8080,
  },
})

console.log('Websocket server: ws://0.0.0.0:8080')
```

### Development vs Production

```ts [env-logging.ts]
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

const isDev = process.env.NODE_ENV === 'development'

fabric.use(loggerPlugin, {
  progress: isDev, // Progress bar in development only
  websocket: isDev ? { port: 3000 } : false, // Websocket in development only
})
```

## Websocket API

### Connecting to Websocket

Connect to the websocket server to receive Fabric events:

```ts [websocket-client.ts]
const ws = new WebSocket('ws://localhost:3000')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Event:', data.type, data.payload)
}

ws.onopen = () => {
  console.log('Connected to Fabric websocket')
}
```

### Event Format

Events are broadcast as JSON:

```json
{
  "type": "file:processing:update",
  "payload": {
    "processed": 5,
    "total": 10,
    "percentage": 50.0
  }
}
```

### Building a Dashboard

Use the websocket to build custom dashboards:

```ts [dashboard-example.ts]
const ws = new WebSocket('ws://localhost:3000')

let startTime: number
let filesProcessed = 0

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data)
  
  if (type === 'lifecycle:start') {
    startTime = Date.now()
    console.log('Generation started...')
  }
  
  if (type === 'file:processing:update') {
    filesProcessed = payload.processed
    console.log(`Progress: ${payload.percentage.toFixed(1)}%`)
  }
  
  if (type === 'lifecycle:end') {
    const duration = Date.now() - startTime
    console.log(`Completed ${filesProcessed} files in ${duration}ms`)
  }
}
```

## Events

The `loggerPlugin` listens to all Fabric lifecycle events:

- `lifecycle:start`
- `lifecycle:end`
- `file:processing:start`
- `file:processing:update`
- `file:processing:end`
- `files:processing:start`
- `files:processing:end`
- `files:writing:start`
- `files:writing:end`

## Best Practices

### Register Logger First

Always register the logger plugin first to capture events from other plugins:

```ts
// ✅ Correct
fabric.use(loggerPlugin)
fabric.use(fsPlugin)
fabric.use(barrelPlugin)

// ❌ Incorrect - may miss events
fabric.use(fsPlugin)
fabric.use(loggerPlugin)
```

### Disable in CI

Disable progress and websocket in CI environments:

```ts
const isCI = process.env.CI === 'true'

fabric.use(loggerPlugin, {
  progress: !isCI,
  websocket: false,
})
```

### Use Websocket for Monitoring

Build custom monitoring tools using the websocket API:

```ts
fabric.use(loggerPlugin, {
  websocket: { port: 3000 },
})
// Connect your dashboard to ws://localhost:3000
```

## See Also

- [Events](/api/core/events) — Lifecycle events reference
- [createFabric](/api/core/create-fabric) — Create a Fabric instance
- [fsPlugin](/api/plugins/fs-plugin) — Write files to disk
