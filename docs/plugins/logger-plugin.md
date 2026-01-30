---
layout: doc
title: logger Plugin - Progress Tracking & Event Logging
description: Use the loggerPlugin for CLI progress bars, event logging, and WebSocket server for Fabric generation dashboards.
outline: deep
---

# Progress & Event Logging Plugin

The loggerPlugin provides beautiful CLI progress bars, event logging, and a WebSocket server for building custom dashboards and tooling.

**Use loggerPlugin when:** You need visual progress feedback or want to stream events to external tools.

**Perfect for:** CLI tools, developer experience, debugging, custom dashboards, build monitoring.

**Key features:**
- Beautiful CLI progress bars (@clack/prompts)
- Real-time percentage and file count
- WebSocket server for custom tooling
- Event streaming for dashboards

## Usage

Register the logger plugin for progress tracking.

**Example:** Enable progress bar and WebSocket server.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
  websocket: true,
})
```

## Plugin Options

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

```ts
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

```ts
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

- CLI Progress Bar: Displays a beautiful progress bar with colored output and symbols using `@clack/prompts`:
- Websocket Broadcasting: Broadcasts Fabric events to connected clients for building custom dashboards

## Examples

### Basic Logging

```ts twoslash
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
  imports: [],
  exports: [],
})

await fabric.write()
```

### Disable Progress in CI

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

const isCI = process.env.CI === 'true'

fabric.use(loggerPlugin, {
  progress: !isCI, // Disable progress bar in CI
  websocket: false, // Disable websocket in CI
})
```

## See Also

- [Events](/core/events) — Lifecycle events reference
- [createFabric](/core/create-fabric) — Create a Fabric instance
- [fsPlugin](/plugins/fs-plugin) — Write files to disk
