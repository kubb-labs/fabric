---
layout: doc
title: Creating Plugins
outline: deep
---

# Creating Plugins

Learn how to create custom plugins to extend Fabric's functionality.

## What are Plugins?

Plugins extend Fabric with reusable functionality. They can:

- Listen to lifecycle events
- Transform files during processing
- Add new methods to the Fabric instance
- Integrate with external tools

## Plugin Structure

Create plugins using the `definePlugin` factory:

```ts twoslash
import { definePlugin } from '@kubb/fabric-core/plugins'

const myPlugin = definePlugin({
  name: 'myPlugin',
  install(fabric, options) {
    // Plugin logic here
  },
})
```

## definePlugin API

The `definePlugin` factory creates plugins that can be registered with `fabric.use()`.

### Signature

```ts
definePlugin<TOptions, TInject>(config: PluginConfig): Plugin
```

### Configuration

#### name

Unique identifier for your plugin.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |


#### install

Called when the plugin is registered via `fabric.use()`. Use this to subscribe to events and perform setup.

|           |                                                    |
|----------:|:---------------------------------------------------|
|     Type: | `(fabric, options) => void \| Promise<void>` |
| Required: | `true`                                             |

**Parameters:**

- `fabric` — The Fabric instance
- `options` — Plugin options passed to `fabric.use()`


#### inject

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

### Type Parameters

#### `TOptions`

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

#### `TInject`

Type definition for methods/properties injected into Fabric.

```ts
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

## Basic Plugin

Create a simple logging plugin:

```ts [hello-plugin.ts]
import { definePlugin } from '@kubb/fabric-core/plugins'

const helloPlugin = definePlugin({
  name: 'helloPlugin',
  install(fabric, options) {
    fabric.context.on('lifecycle:start', () => {
      console.log('Hello from plugin!')
    })
  },
})

// Usage
const fabric = createFabric()
fabric.use(helloPlugin)
```

## Plugin with Options

Create a plugin that accepts configuration:

```ts [logger-plugin.ts]
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

    fabric.context.on('lifecycle:start', () => {
      console.log(`${prefix} Starting...`)
    })

    if (verbose) {
      fabric.context.on('file:processing:update', ({ processed, total }) => {
        console.log(`${prefix} Progress: ${processed}/${total}`)
      })
    }

    fabric.context.on('lifecycle:end', () => {
      console.log(`${prefix} Completed!`)
    })
  },
})

// Usage
fabric.use(loggerPlugin, {
  prefix: '[GEN]',
  verbose: true,
})
```

## Injecting Methods

Plugins can add methods to the Fabric instance using the `inject` function:

```ts [inject-methods.ts]
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

### Use Descriptive Names

Name your plugin clearly:

```ts
// ✅ Good
const timestampPlugin = definePlugin({ name: 'timestampPlugin', ... })

// ❌ Bad
const plugin1 = definePlugin({ name: 'p1', ... })
```

### Provide Type Safety

Use TypeScript generics for options and injected methods:

```ts
type Options = { verbose: boolean }
type Methods = { log: (msg: string) => void }

const plugin = definePlugin<Options, Methods>({ ... })
```

### Handle Errors Gracefully

Don't crash the entire generation:

```ts
install(fabric, options) {
  fabric.context.on('file:processing:update', ({ file }) => {
    try {
      // Your logic
    } catch (error) {
      console.error(`Plugin error for ${file.path}:`, error)
      // Don't rethrow unless critical
    }
  })
}
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


## See Also

- [Events](/core/events) — Available lifecycle events
- [Creating Parsers](/guide/creating-parsers) — Create custom parsers
- [fsPlugin](/plugins/fs-plugin) — File system plugin example
- [loggerPlugin](/plugins/logger-plugin) — Example plugin with options
