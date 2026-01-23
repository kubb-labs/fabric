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

```ts [plugin-structure.ts]
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

### Configuration Fields

| Field      | Required | Type                                      | Description                                                                                                  |
|------------|----------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `name`     | Yes      | `string`                                  | Unique identifier for your plugin.                                                                            |
| `install`  | Yes      | `(fabric, options) => void \| Promise<void>` | Called when the plugin is registered. Subscribe to events and perform setup here.                            |
| `inject`   | No       | `(fabric, options) => TInject`            | Return synchronously the runtime methods/properties to merge into `fabric` (e.g., `write`, `render`). Must not be async. |

### Type Parameters

| Parameter  | Description                                                  |
|------------|--------------------------------------------------------------|
| `TOptions` | Type of options accepted by the plugin.                      |
| `TInject`  | Type of methods/properties injected into the Fabric instance. |

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

## Event-Driven Plugins

Create plugins that react to lifecycle events:

```ts [event-plugin.ts]
import { definePlugin } from '@kubb/fabric-core/plugins'
import { writeFile } from 'fs/promises'

type MetricsOptions = {
  outputPath?: string
}

const metricsPlugin = definePlugin<MetricsOptions>({
  name: 'metricsPlugin',
  install(fabric, options) {
    const outputPath = options?.outputPath ?? './metrics.json'
    
    let startTime: number
    let filesProcessed = 0
    
    fabric.context.on('lifecycle:start', () => {
      startTime = Date.now()
      filesProcessed = 0
    })
    
    fabric.context.on('file:processing:end', () => {
      filesProcessed++
    })
    
    fabric.context.on('lifecycle:end', async () => {
      const duration = Date.now() - startTime
      const metrics = {
        filesProcessed,
        duration,
        timestamp: new Date().toISOString(),
      }
      
      await writeFile(outputPath, JSON.stringify(metrics, null, 2))
      console.log(`Metrics saved to ${outputPath}`)
    })
  },
})

// Usage
fabric.use(metricsPlugin, {
  outputPath: './build-metrics.json',
})
```

## File Transformation Plugin

Transform files during processing:

```ts [transform-plugin.ts]
import { definePlugin } from '@kubb/fabric-core/plugins'

type TransformOptions = {
  addHeader?: boolean
  headerText?: string
}

const transformPlugin = definePlugin<TransformOptions>({
  name: 'transformPlugin',
  install(fabric, options) {
    const addHeader = options?.addHeader ?? true
    const headerText = options?.headerText ?? '// Auto-generated - do not edit'
    
    fabric.context.on('file:resolve:path', ({ file }) => {
      // Normalize paths
      file.path = file.path.replace(/\\/g, '/')
    })
    
    fabric.context.on('file:processing:update', ({ file }) => {
      if (addHeader) {
        // Add header to first source
        if (file.sources.length > 0) {
          file.sources[0].value = `${headerText}\n\n${file.sources[0].value}`
        }
      }
    })
  },
})

// Usage
fabric.use(transformPlugin, {
  addHeader: true,
  headerText: '// Generated by Fabric',
})
```

## Plugin Best Practices

### 1. Use Descriptive Names

Name your plugin clearly:

```ts
// ✅ Good
const timestampPlugin = definePlugin({ name: 'timestampPlugin', ... })

// ❌ Bad
const plugin1 = definePlugin({ name: 'p1', ... })
```

### 2. Provide Type Safety

Use TypeScript generics for options and injected methods:

```ts
type Options = { verbose: boolean }
type Methods = { log: (msg: string) => void }

const plugin = definePlugin<Options, Methods>({ ... })
```

### 3. Handle Errors Gracefully

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

### 4. Clean Up Resources

Release resources when done:

```ts
install(fabric, options) {
  const server = startServer()
  
  fabric.context.on('lifecycle:end', async () => {
    await server.close()
  })
}
```

### 5. Document Your Plugin

Add JSDoc comments:

```ts
/**
 * Adds timestamps to generated files
 * 
 * @example
 * ```ts
 * fabric.use(timestampPlugin, { format: 'iso' })
 * ```
 */
const timestampPlugin = definePlugin({ ... })
```

## Real-World Examples

### File Counter Plugin

```ts [file-counter.ts]
import { definePlugin } from '@kubb/fabric-core/plugins'

type CounterMethods = {
  getFileCount: () => number
}

const fileCounterPlugin = definePlugin<{}, CounterMethods>({
  name: 'fileCounterPlugin',
  install(fabric, options) {
    // No installation logic needed
  },
  inject(fabric, options) {
    return {
      getFileCount: () => fabric.files.length,
    }
  },
})

// Usage
fabric.use(fileCounterPlugin)
await fabric.addFile(/* ... */)
console.log(`Files to generate: ${fabric.getFileCount()}`)
```

### Backup Plugin

```ts [backup-plugin.ts]
import { definePlugin } from '@kubb/fabric-core/plugins'
import { cp } from 'fs/promises'

type BackupOptions = {
  backupPath: string
}

const backupPlugin = definePlugin<BackupOptions>({
  name: 'backupPlugin',
  install(fabric, options) {
    if (!options?.backupPath) {
      throw new Error('backupPath is required')
    }
    
    fabric.context.on('files:writing:start', async ({ files }) => {
      const outputPath = files[0]?.path?.split('/')[0]
      
      if (outputPath) {
        console.log(`Backing up ${outputPath} to ${options.backupPath}`)
        await cp(outputPath, options.backupPath, { recursive: true })
      }
    })
  },
})

// Usage
fabric.use(backupPlugin, {
  backupPath: './backup',
})
```

## See Also

- [definePlugin](/api/plugins/define-plugin) — Plugin factory API
- [Events](/api/core/events) — Available lifecycle events
- [Creating Parsers](/guide/creating-parsers) — Create custom parsers
- [fsPlugin](/api/plugins/fs-plugin) — File system plugin example
