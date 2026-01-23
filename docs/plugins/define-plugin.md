---
layout: doc
title: definePlugin
outline: deep
---

# definePlugin

Factory function for creating custom Fabric plugins.

## Installation

The `definePlugin` factory is included in `@kubb/fabric-core`:

```ts [import.ts]
import { definePlugin } from '@kubb/core/plugins'
```

## Usage

```ts [basic-usage.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

const myPlugin = definePlugin({
  name: 'myPlugin',
  install(fabric, options) {
    fabric.context.events.on('lifecycle:start', () => {
      console.log('Fabric started')
    })
  },
})

const fabric = createFabric()
fabric.use(myPlugin)
```

## Signature

```ts
definePlugin<TOptions, TInject>(config: PluginConfig): Plugin
```

## Configuration

### name

Unique identifier for your plugin.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

**Example:**

```ts [name.ts]
const myPlugin = definePlugin({
  name: 'myPlugin', // Used for debugging and identification
  install(fabric) {
    // Plugin logic
  },
})
```

### install

Called when the plugin is registered via `fabric.use()`. Use this to subscribe to events and perform setup.

|           |                                                    |
|----------:|:---------------------------------------------------|
|     Type: | `(fabric, options) => void \| Promise<void>` |
| Required: | `true`                                             |

**Parameters:**

- `fabric` — The Fabric instance
- `options` — Plugin options passed to `fabric.use()`

**Example:**

```ts [install.ts]
const myPlugin = definePlugin({
  name: 'myPlugin',
  install(fabric, options) {
    // Listen to events
    fabric.context.events.on('lifecycle:start', () => {
      console.log('Starting...')
    })

    // Access options
    if (options?.verbose) {
      console.log('Verbose mode enabled')
    }
  },
})
```

### inject

Optionally return methods or properties to merge into the Fabric instance. Must be synchronous.

> [!IMPORTANT]
> The `inject` function must be synchronous and cannot be async.

|           |                                    |
|----------:|:-----------------------------------|
|     Type: | `(fabric, options) => TInject`     |
| Required: | `false`                            |

**Parameters:**

- `fabric` — The Fabric instance
- `options` — Plugin options passed to `fabric.use()`

**Returns:** Object with methods/properties to add to `fabric`

**Example:**

```ts [inject.ts]
const myPlugin = definePlugin<
  { prefix?: string },
  { log: (msg: string) => void }
>({
  name: 'myPlugin',
  install(fabric, options) {
    // Setup logic
  },
  inject(fabric, options) {
    return {
      log(msg: string) {
        const prefix = options?.prefix ?? '[LOG]'
        console.log(`${prefix} ${msg}`)
      },
    }
  },
})

const fabric = createFabric()
fabric.use(myPlugin, { prefix: '[INFO]' })

// Injected method is now available
fabric.log('Hello World') // -> [INFO] Hello World
```

## Type Parameters

### TOptions

Type definition for plugin options.

```ts [type-options.ts]
type MyPluginOptions = {
  enabled?: boolean
  logLevel?: 'info' | 'warn' | 'error'
}

const myPlugin = definePlugin<MyPluginOptions>({
  name: 'myPlugin',
  install(fabric, options) {
    if (options?.enabled) {
      console.log(`Log level: ${options.logLevel ?? 'info'}`)
    }
  },
})
```

### TInject

Type definition for methods/properties injected into Fabric.

```ts [type-inject.ts]
type MyPluginInject = {
  sayHello: (name: string) => void
  getStatus: () => string
}

const myPlugin = definePlugin<{}, MyPluginInject>({
  name: 'myPlugin',
  install(fabric) {
    // Setup
  },
  inject(fabric) {
    return {
      sayHello(name: string) {
        console.log(`Hello ${name}!`)
      },
      getStatus() {
        return 'ready'
      },
    }
  },
})
```

## Examples

### Event Listener Plugin

```ts [event-listener.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

const progressPlugin = definePlugin({
  name: 'progressPlugin',
  install(fabric) {
    fabric.context.events.on('file:processing:update', ({ processed, total, percentage }) => {
      console.log(`Progress: ${percentage.toFixed(1)}% (${processed}/${total})`)
    })

    fabric.context.events.on('lifecycle:end', () => {
      console.log('✓ Generation complete')
    })
  },
})

const fabric = createFabric()
fabric.use(progressPlugin)
```

### Plugin with Options

```ts [with-options.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

type LoggerOptions = {
  level?: 'info' | 'warn' | 'error'
  prefix?: string
}

const loggerPlugin = definePlugin<LoggerOptions>({
  name: 'loggerPlugin',
  install(fabric, options) {
    const level = options?.level ?? 'info'
    const prefix = options?.prefix ?? '[Fabric]'

    fabric.context.events.on('lifecycle:start', () => {
      if (level === 'info') {
        console.log(`${prefix} Starting...`)
      }
    })

    fabric.context.events.on('lifecycle:end', () => {
      console.log(`${prefix} Complete`)
    })
  },
})

const fabric = createFabric()
fabric.use(loggerPlugin, { level: 'info', prefix: '[Gen]' })
```

### Plugin with Injected Methods

```ts [with-inject.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

type MetricsInject = {
  getMetrics: () => { filesProcessed: number; duration: number }
}

const metricsPlugin = definePlugin<{}, MetricsInject>({
  name: 'metricsPlugin',
  install(fabric) {
    // No installation logic needed
  },
  inject(fabric) {
    let filesProcessed = 0
    let startTime = 0

    fabric.context.events.on('lifecycle:start', () => {
      startTime = Date.now()
    })

    fabric.context.events.on('file:processing:end', () => {
      filesProcessed++
    })

    return {
      getMetrics() {
        return {
          filesProcessed,
          duration: Date.now() - startTime,
        }
      },
    }
  },
})

const fabric = createFabric()
fabric.use(metricsPlugin)

// Later...
const metrics = fabric.getMetrics()
console.log(`Processed ${metrics.filesProcessed} files in ${metrics.duration}ms`)
```

### File Transformation Plugin

```ts [transformation.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

type BannerOptions = {
  text: string
}

const bannerPlugin = definePlugin<BannerOptions>({
  name: 'bannerPlugin',
  install(fabric, options) {
    const banner = options?.text ?? '// Generated by Fabric'

    fabric.context.events.on('file:resolve:path', ({ file }) => {
      // Add banner to file metadata
      file.meta = {
        ...file.meta,
        banner,
      }
    })
  },
})

const fabric = createFabric()
fabric.use(bannerPlugin, { text: '// Auto-generated - do not edit' })
```

### Validation Plugin

```ts [validation.ts]
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/core/plugins'

const validationPlugin = definePlugin({
  name: 'validationPlugin',
  install(fabric) {
    fabric.context.events.on('files:processing:start', ({ files }) => {
      for (const file of files) {
        if (!file.baseName) {
          throw new Error(`File missing baseName: ${file.path}`)
        }
        if (!file.sources || file.sources.length === 0) {
          throw new Error(`File has no sources: ${file.path}`)
        }
      }
    })
  },
})

const fabric = createFabric()
fabric.use(validationPlugin)
```

## Best Practices

### Name Your Plugins

Use descriptive names that indicate the plugin's purpose:

```ts
definePlugin({
  name: 'validationPlugin', // Clear and descriptive
  // ...
})
```

### Handle Options Gracefully

Provide sensible defaults for all options:

```ts
install(fabric, options) {
  const enabled = options?.enabled ?? true
  const level = options?.level ?? 'info'
  // ...
}
```

### Use TypeScript

Define types for options and injected methods:

```ts
type MyOptions = {
  verbose?: boolean
}

type MyInject = {
  doSomething: () => void
}

definePlugin<MyOptions, MyInject>({
  // ...
})
```

### Clean Up Resources

Remove event listeners if needed:

```ts
install(fabric) {
  const handler = () => console.log('Event')
  
  fabric.context.events.on('lifecycle:start', handler)
  
  // Clean up if needed
  fabric.context.events.on('lifecycle:end', () => {
    fabric.context.events.off('lifecycle:start', handler)
  })
}
```

## See Also

- [Creating Plugins](/guide/creating-plugins) — Plugin development guide
- [Events](/core/events) — Available lifecycle events
- [fsPlugin](/plugins/fs-plugin) — Example plugin implementation
- [loggerPlugin](/plugins/logger-plugin) — Example plugin with options
