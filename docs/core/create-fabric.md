---
layout: doc
title: createFabric
outline: deep
---

# createFabric

Creates a new Fabric instance for file generation.

## Usage

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
```

## Options

Optional configuration for the Fabric instance.

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


## See Also

- [fsPlugin](/plugins/fs-plugin) — Write files to disk
- [fsxPlugin](/plugins/fsx-plugin) — Render FSX components to files
- [reactPlugin](/plugins/react-plugin) — Render React components to files
- [loggerPlugin](/plugins/logger-plugin) — Progress tracking
- [graphPlugin](/plugins/graph-plugin) — Visualizes the dependency graph
- [barrelPlugin](/plugins/barrel-plugin) — Generate barrel files
- [Events](/core/events) — Lifecycle events reference
