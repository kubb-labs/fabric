---
layout: doc
title: createFabric API - Initialize Fabric Code Generator
description: Create a Fabric instance with createFabric(). Register plugins, add files, and manage code generation lifecycle.
outline: deep
---

# createFabric() API Reference

Creates a new Fabric instance for programmatic file generation. The Fabric instance provides methods for plugin registration, file management, and lifecycle control.

**Use createFabric() to:**
- Initialize a code generator instance
- Register plugins and parsers
- Add files to the generation queue
- Control the file generation lifecycle

**Returns:** A Fabric instance with methods for `use()`, `addFile()`, `write()`, and more.

## Usage

Create a Fabric instance to start generating files.

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
|  Default: | `undefined`      |

## Return Value

Returns a **Fabric instance** with the following methods and properties:

- `fabric.use()` - Register plugins and parsers
- `fabric.addFile()` - Add files to generation queue
- `fabric.write()` - Write files to disk
- `fabric.render()` - Render FSX components
- `fabric.files` - Access file queue
- `fabric.context` - Access internal context

## Instance Methods


### fabric.use(plugin | parser, options?)

Registers plugins and parsers with the Fabric instance. Plugins extend functionality (fs, logger, barrel), while parsers control file output formatting.

**Parameters:**
- `plugin | parser` — Plugin or parser to register
- `options?` — Optional configuration object

**Example:** Register plugins and parsers.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin, { clean: { path: './output' } })
fabric.use(typescriptParser)
```

**Learn more:** [Plugins](/plugins) | [Parsers](/parsers)

### fabric.addFile(...files)

Adds one or more files to the generation queue. Files are processed and written when `fabric.write()` is called.

**Parameters:**
- `...files` — One or more file objects with `baseName`, `path`, `sources`, `imports`, and `exports`

**Example:** Add a single file.

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

**Example:** Add multiple files at once.

```ts
await fabric.addFile(
  { baseName: 'user.ts', path: './generated/user.ts', sources: [/* ... */], imports: [], exports: [] },
  { baseName: 'post.ts', path: './generated/post.ts', sources: [/* ... */], imports: [], exports: [] }
)
```

```

**Learn more:** [File Structure](/core/components/file)

### fabric.write(options?)

Writes all files in the queue to disk using registered parsers. The fs plugin must be registered.

**Parameters:**
- `options?.extension` — Map file extensions (e.g., `{ '.vue': '.ts' }`)

**Example:**

```ts
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx'
  }
})
```

**Learn more:** [fs Plugin](/plugins/fs-plugin)

### fabric.render(component)

Renders an FSX component to a string. Requires the fsx plugin.

**Parameters:**
- `component` — FSX component to render

**Returns:** Promise<string>

**Example:**

```ts
import { Type } from '@kubb/fabric-core'

const component = Type({ name: 'User', export: true }).children(['{ id: number }'])
const output = await fabric.render(component)
// output: "export type User = { id: number }"
```

**Learn more:** [fsx Plugin](/plugins/fsx-plugin)

### fabric.files

Getter property that returns all files currently in the generation queue.

**Returns:** `KubbFile.File[]`

**Example:**

```ts
console.log(`Files in queue: ${fabric.files.length}`)
```

### fabric.context

Internal context object containing events, options, FileManager, and registered plugins/parsers.

**Properties:**

- `events` — Event emitter for lifecycle events
- `options` — Fabric configuration options
- `fileManager` — File cache manager
- `plugins` — Array of registered plugins
- `parsers` — Array of registered parsers

**Example:**

```ts
fabric.context.on('lifecycle:start', () => {
  console.log('Generation started')
})
```

**Learn more:** [Events](/core/events)


## Plugin-Injected Methods

Plugins can inject additional methods into the Fabric instance. These are available after registering the plugin.

**Examples:**

- **fs Plugin** - Adds `fabric.write()` method
- **fsx Plugin** - Adds `fabric.render()` method
- **barrel Plugin** - Adds `fabric.writeEntry()` method

See individual plugin documentation for complete method details.

## Complete Example

Here's a complete code generator using createFabric:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin, barrelPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

// Create Fabric instance
const fabric = createFabric()

// Register plugins
fabric.use(loggerPlugin, { progress: true })
fabric.use(barrelPlugin, { root: './generated', mode: 'named' })
fabric.use(fsPlugin, { clean: { path: './generated' } })
fabric.use(typescriptParser)

// Add files
await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/models/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true }
  ],
  imports: [],
  exports: []
})

await fabric.addFile({
  baseName: 'post.ts',
  path: './generated/models/post.ts',
  sources: [
    { value: 'export type Post = { id: number; title: string }', isExportable: true }
  ],
  imports: [],
  exports: []
})

// Write files to disk
await fabric.write()

// Generate barrel files
await fabric.writeEntry({ root: './generated', mode: 'named' })
```

**Output:**
- `generated/models/user.ts` - User type
- `generated/models/post.ts` - Post type
- `generated/models/index.ts` - Barrel file
- `generated/index.ts` - Entry barrel

## Next Steps

- [Events API](/core/events) - Listen to lifecycle events
- [Components](/core/components/file) - Use Fabric components
- [Plugins](/plugins) - Available plugins
- [Quick Start](/getting-started/quick-start) - Build your first generator

## FAQ

### Can I create multiple Fabric instances?

Yes, each `createFabric()` call creates an independent instance with its own file queue and context.

### When should I call fabric.write()?

After adding all files with `addFile()`. The write method processes and writes all queued files.

### Do I need to register parsers?

Yes, parsers are required to convert file objects to strings. Register at least one parser (e.g., `typescriptParser`).

### Can plugins modify the Fabric instance?

Yes, plugins can inject new methods and listen to events. See individual plugin docs for details.

### What's the difference between fabric.write() and fabric.render()?

- `write()` - Writes queued files to disk (requires fs plugin)
- `render()` - Renders a single FSX component to a string (requires fsx plugin)

## Related Resources

- [fs Plugin](/plugins/fs-plugin) - Write files to disk
- [fsx Plugin](/plugins/fsx-plugin) - Render FSX components
- [react Plugin](/plugins/react-plugin) - Render React components
- [logger Plugin](/plugins/logger-plugin) - Progress tracking
- [barrel Plugin](/plugins/barrel-plugin) - Generate barrel files
