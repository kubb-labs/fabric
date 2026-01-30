---
layout: doc
title: createFabric - Initialize Fabric Code Generator JSX
description: Create a Fabric instance to generate code files. Register plugins, add files, and manage the code generation lifecycle.
outline: deep
---

# createFabric API Reference

Creates a new Fabric instance for programmatic file generation. Use this function to initialize your code generator, register plugins, and manage the generation lifecycle. The Fabric instance is the core entry point for all file operations.

## Usage

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
```

## Parameters

Currently, `createFabric()` accepts no parameters. This is reserved for future configuration options.

|           |                  |
|----------:|:-----------------|
|     Type: | `FabricOptions`  |
| Required: | `false`          |

Currently, `createFabric()` accepts no options. This parameter is reserved for future use.

### `fabric.use()`

Registers plugins and parsers with the Fabric instance.

- `plugin` — A plugin or parser created with `definePlugin` or `defineParser`
- `options` — Plugin-specific configuration options

**Example:**

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin, { clean: { path: './output' } })
fabric.use(typescriptParser)
```

### `fabric.addFile()`

Adds one or more files to the generation queue.

- `files` — One or more file objects to generate

**Example:**

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
  imports: [],
  exports: []
})

// Add multiple files
await fabric.addFile(
  { baseName: 'user.ts', path: './generated/user.ts', sources: [/* ... */], imports: [], exports: [] },
  { baseName: 'post.ts', path: './generated/post.ts', sources: [/* ... */], imports: [], exports: [] }
)
```

### `fabric.files`

Getter that returns all files in the generation queue.

### `fabric.context`

Internal context holding events, options, FileManager, and installed plugins/parsers.


**Properties:**

- `events` — Event emitter for lifecycle events
- `options` — Fabric configuration
- `fileManager` — Manages file cache
- `plugins` — Registered plugins
- `parsers` — Registered parsers

**Example:**

```ts [context-usage.ts]
// Listen to events
fabric.context.on('lifecycle:start', () => {
  console.log('Started!')
})

// Access file manager
const files = fabric.context.fileManager.files
```

## Plugin-Injected Methods

Plugins can inject additional methods into the Fabric instance. These methods are available after registering the plugin with `fabric.use()`.

See the documentation for each plugin to learn about any additional methods they provide.


## FAQ

### When should I use createFabric() vs definePlugin()?

Use `createFabric()` to initialize your code generator and manage the file generation lifecycle. Use `definePlugin()` when building reusable plugins that extend Fabric's capabilities. The Fabric instance orchestrates plugins, while plugins add specific functionality.

### How do I register multiple plugins?

Call `fabric.use()` for each plugin you want to register. Plugins are applied in the order they are registered. You can chain multiple `use()` calls or register them sequentially.

### Can I add files before registering plugins?

Yes, but it's recommended to register plugins first. Some plugins may need to be active before files are added to handle pre-processing or validation correctly.

### What's the difference between addFile() and the file manager?

`addFile()` is the public API for adding files to the generation queue. The file manager (`fabric.context.fileManager`) is an internal component that caches and manages files. Always use `addFile()` in your application code.

## See Also

- [fsPlugin](/plugins/fs-plugin) — Write generated files to disk
- [fsxPlugin](/plugins/fsx-plugin) — Render FSX components to files
- [reactPlugin](/plugins/react-plugin) — Render React components to files
- [loggerPlugin](/plugins/logger-plugin) — Progress tracking and logging
- [Events](/core/events) — Lifecycle events reference
- [definePlugin](/core/define-plugin) — Create custom plugins
