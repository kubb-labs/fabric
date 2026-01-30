---
layout: doc
title: Creating Fabric Plugins - Extend Code Generators
description: Build custom Fabric plugins to add lifecycle hooks, file transformations, and new capabilities to code generators.
outline: deep
---

# Creating Plugins

Build custom plugins to extend Fabric's code generation capabilities with lifecycle hooks, file transformations, and custom methods. Plugins are the primary extension mechanism for Fabric.

## What are Plugins?

Plugins extend Fabric by listening to lifecycle events, transforming files, and adding new methods. They're composable, reusable pieces of functionality that integrate seamlessly with Fabric's event-driven architecture.

**Plugins can:**
- Listen to file and lifecycle events
- Transform file content during processing
- Add custom methods to the Fabric instance
- Integrate with external tools (formatters, linters, etc.)

## Why Create Custom Plugins?

- **Extend functionality** - Add features not available in built-in plugins
- **Integrate tools** - Connect Prettier, ESLint, or other formatters
- **Custom transformations** - Apply domain-specific file processing
- **Reusable logic** - Share plugin across projects and teams

## How to Create a Plugin

Use the `definePlugin` factory from `@kubb/fabric-core/plugins`:

```ts
import { definePlugin } from '@kubb/fabric-core/plugins'

const myPlugin = definePlugin({
  name: 'myPlugin',
  install(fabric, options) {
    // Subscribe to events, transform files
  }
})
```

## Installation

The `definePlugin` factory is included in `@kubb/fabric-core/plugins`:

```ts
import { definePlugin } from '@kubb/fabric-core/plugins'
```

## Usage

Create plugins using the `definePlugin` factory:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'

const myPlugin = definePlugin({
  name: 'myPlugin',
  install(fabric) {
    // Plugin logic here
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


### install

Called when the plugin is registered via `fabric.use()`. Use this to subscribe to events and perform setup.

|           |                                                    |
|----------:|:---------------------------------------------------|
|     Type: | `(fabric, options) => void \| Promise<void>` |
| Required: | `true`                                             |

**Parameters:**

- `fabric` — The Fabric instance
- `options` — Plugin options passed to `fabric.use()`


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

## Type Parameters

### `TOptions`

Type definition for plugin options.

```ts
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

### `TInject`

Type definition for methods/properties injected into Fabric.

```ts twoslash
import { definePlugin } from '@kubb/fabric-core/plugins'

declare global {
  namespace Kubb {
    interface Fabric {
      sayHello: (name: string) => void
      getStatus: () => string
    }
  }
}

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

### Basic Plugin

Create a simple logging plugin:

```tsx twoslash
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'

const helloPlugin = definePlugin({
  name: 'helloPlugin',
  install(fabric) {
    fabric.on('lifecycle:start', () => {
      console.log('Hello from plugin!')
    })
  },
})

const fabric = createFabric()
fabric.use(helloPlugin)
```

## Plugin with Options

Create a plugin that accepts configuration:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'

type LoggerOptions = {
  prefix?: string
  verbose?: boolean
}

const loggerPlugin = definePlugin<LoggerOptions>({
  name: 'loggerPlugin',
  install(fabric, options) {
    const prefix = options?.prefix ?? '[LOG]'
    const verbose = options?.verbose ?? false

    fabric.on('lifecycle:start', () => {
      console.log(`${prefix} Starting...`)
    })

    if (verbose) {
      fabric.on('file:processing:update', ({ processed, total }) => {
        console.log(`${prefix} Progress: ${processed}/${total}`)
      })
    }

    fabric.on('lifecycle:end', () => {
      console.log(`${prefix} Completed!`)
    })
  },
})

const fabric = createFabric()
fabric.use(loggerPlugin, {
  prefix: '[GEN]',
  verbose: true,
})
```

## Injecting Methods

Plugins can add methods to the Fabric instance using the `inject` function:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { definePlugin } from '@kubb/fabric-core/plugins'

type ValidatorOptions = {
  strict?: boolean
}

type InjectedMethods = {
  validate: () => Promise<boolean>
}

declare global {
  namespace Kubb {
    interface Fabric {
      validate: () => Promise<boolean>
    }
  }
}

const validatorPlugin = definePlugin<ValidatorOptions, InjectedMethods>({
  name: 'validatorPlugin',
  install(fabric, options) {
    // Setup logic
  },
  inject(fabric, options) {
    return {
      validate: async () => {
        const files = fabric.files
        const strict = options?.strict ?? false

        for (const file of files) {
          if (!file.path) {
            if (strict) throw new Error(`File missing path: ${file.baseName}`)
            console.warn(`Warning: File missing path: ${file.baseName}`)
            return false
          }
        }

        return true
      },
    }
  },
})

// Usage
const fabric = createFabric()
fabric.use(validatorPlugin, { strict: true })

await fabric.addFile(/* ... */)
const isValid = await fabric.validate()
```

## Plugin Best Practices

### Name Your Plugins

Use descriptive names that indicate the file type:

```ts
definePlugin({
  name: 'jsonParser', // Clear and descriptive
  install(){

  },
  inject(fabric, options) {
    return '...'
  },
})
```

### Use TypeScript

Use TypeScript generics for options and injected methods:

```ts
type Options = { verbose: boolean }
type Methods = { log: (msg: string) => void }

const plugin = definePlugin<Options, Methods>({ ... })
```

### Clean Up Resources

Release resources when done:

```ts
install(fabric, options) {
  const server = startServer()

  fabric.context.on('lifecycle:end', async () => {
    await server.close()
  })
}
```

### Use Default Values

Provide sensible defaults for all options:

```ts
install(fabric, options) {
  const enabled = options?.enabled ?? true
  const level = options?.level ?? 'info'
  // ...
}
```

## FAQ

### What's the difference between install and inject?

`install` is called when the plugin is registered - use it for event subscriptions and setup. `inject` returns methods added to the Fabric instance - use it for public plugin APIs.

### Can inject be async?

No. The `inject` function must be synchronous. For async operations, use `install` or create async methods that are returned from `inject`.

### How do I access files in my plugin?

Use `fabric.files` to access all files, or subscribe to file events like `file:created` and `file:changed` to react to file operations.

### Can plugins depend on other plugins?

Yes, but manage order carefully. Register dependencies before dependent plugins. Use lifecycle events to coordinate between plugins.

## See also

- [Events API](/core/events) — All available lifecycle and file events
- [Creating Parsers](/guide/creating-parsers) — Build custom file parsers
- [File System Plugin](/plugins/fs-plugin) — Example of a full-featured plugin
- [Logger Plugin](/plugins/logger-plugin) — Simple plugin with options

## Next Steps

- [Explore built-in plugins](/plugins/fs-plugin) - See real-world plugin examples
- [Learn about Events](/core/events) - Understand the event system
- [Build a parser](/guide/creating-parsers) - Create custom file type handlers
