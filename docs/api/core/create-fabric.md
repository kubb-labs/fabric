---
layout: doc
title: createFabric
outline: deep
---

# createFabric

Creates a new Fabric instance for file generation.

## Usage

```ts [basic-usage.ts]
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
```

## Signature

```ts
function createFabric(options?: FabricOptions): Fabric
```

## Parameters

### options

Optional configuration for the Fabric instance.

|           |                  |
|----------:|:-----------------|
|     Type: | `FabricOptions`  |
| Required: | `false`          |

Currently, `createFabric()` accepts no options. This parameter is reserved for future use.

## Return Value

Returns a `Fabric` instance with the following properties and methods:

### fabric.use()

Registers plugins and parsers with the Fabric instance.

```ts
fabric.use<TOptions, TInjectedMethods>(
  plugin: Plugin<TOptions, TInjectedMethods>,
  options?: TOptions
): Fabric & TInjectedMethods
```

**Parameters:**

- `plugin` — A plugin or parser created with `definePlugin` or `defineParser`
- `options` — Plugin-specific configuration options

**Returns:** The Fabric instance with injected methods from the plugin

**Example:**

```ts [use-plugin.ts]
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin, { clean: { path: './output' } })
fabric.use(typescriptParser)
```

### fabric.addFile()

Adds one or more files to the generation queue.

```ts
fabric.addFile(...files: KubbFile.File[]): Promise<void>
```

**Parameters:**

- `files` — One or more file objects to generate

**Returns:** Promise that resolves when files are added

**Example:**

```ts [add-file.ts]
await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
})

// Add multiple files
await fabric.addFile(
  { baseName: 'user.ts', path: './generated/user.ts', sources: [/* ... */] },
  { baseName: 'post.ts', path: './generated/post.ts', sources: [/* ... */] }
)
```

### fabric.files

Getter that returns all files in the generation queue.

```ts
get fabric.files(): KubbFile.File[]
```

**Returns:** Array of all queued files

**Example:**

```ts [get-files.ts]
await fabric.addFile(/* ... */)

console.log(`Queued files: ${fabric.files.length}`)
```

### fabric.context

Internal context holding events, options, FileManager, and installed plugins/parsers.

```ts
fabric.context: {
  events: EventEmitter
  options: FabricOptions
  fileManager: FileManager
  plugins: Plugin[]
  parsers: Parser[]
}
```

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

### fabric.write()

*Injected by `fsPlugin`*

Writes all queued files to disk.

```ts
fabric.write(options?: WriteOptions): Promise<void>
```

**Parameters:**

- `options.extension` — Maps input file extensions to output extensions

**Example:**

```ts [write-files.ts]
import { fsPlugin } from '@kubb/fabric-core/plugins'

fabric.use(fsPlugin)

await fabric.addFile(/* ... */)
await fabric.write()

// With extension mapping
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

### fabric.writeEntry()

*Injected by `barrelPlugin`*

Generates an entry barrel file at the specified root.

```ts
fabric.writeEntry(
  root: string,
  mode: 'all' | 'named' | 'propagate' | false
): Promise<void>
```

**Parameters:**

- `root` — Root directory for the entry barrel
- `mode` — Export style ('all', 'named', 'propagate', or false)

**Example:**

```ts [write-entry.ts]
import { barrelPlugin } from '@kubb/fabric-core/plugins'

fabric.use(barrelPlugin, { root: './generated', mode: 'named' })

await fabric.write()
await fabric.writeEntry('./generated', 'named')
```

### fabric.render()

*Injected by `reactPlugin`*

Renders a React component tree to the terminal.

```ts
fabric.render(App: React.ElementType): Promise<void> | void
```

**Parameters:**

- `App` — React component to render

**Example:**

```ts [render-react.ts]
import { reactPlugin } from '@kubb/react-fabric/plugins'

fabric.use(reactPlugin)

await fabric.render(() => <App />)
```

### fabric.renderToString()

*Injected by `reactPlugin`*

Renders a React component and returns the output as a string.

```ts
fabric.renderToString(App: React.ElementType): Promise<string> | string
```

**Parameters:**

- `App` — React component to render

**Returns:** Rendered output as string

**Example:**

```ts [render-to-string.ts]
import { reactPlugin } from '@kubb/react-fabric/plugins'

fabric.use(reactPlugin)

const output = await fabric.renderToString(() => <App />)
console.log(output)
```

### fabric.waitUntilExit()

*Injected by `reactPlugin`*

Waits until the rendered React app exits.

```ts
fabric.waitUntilExit(): Promise<void>
```

**Example:**

```ts [wait-exit.ts]
await fabric.render(() => <App />)
await fabric.waitUntilExit()
console.log('App exited')
```

## Examples

### Basic File Generation

```ts [basic-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, { clean: { path: './generated' } })
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'types.ts',
  path: './generated/types.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
})

await fabric.write()
```

### With Events and Logging

```ts [events-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.context.on('lifecycle:start', () => console.log('Starting...'))
fabric.context.on('lifecycle:end', () => console.log('Done!'))

fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile(/* ... */)
await fabric.write()
```

### Multiple Parsers

```ts [multi-parser.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser, tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)
fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'component.tsx',
  path: './generated/component.tsx',
  sources: [/* ... */],
})

await fabric.write({ extension: { '.tsx': '.tsx' } })
```

## See Also

- [fsPlugin](/api/plugins/fs-plugin) — Write files to disk
- [loggerPlugin](/api/plugins/logger-plugin) — Progress tracking
- [barrelPlugin](/api/plugins/barrel-plugin) — Generate barrel files
- [Events](/api/core/events) — Lifecycle events reference
