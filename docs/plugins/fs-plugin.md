---
layout: doc
title: fs Plugin - Write Generated Files to Disk
description: Use the fsPlugin to write generated code files to disk with dry run mode, cleanup, and pre-write hooks in Fabric.
outline: deep
---

# File System Plugin

The fsPlugin writes generated files to disk with support for dry run mode, directory cleanup, and pre-write callbacks.

**Use fsPlugin when:** You need to write generated code files to the filesystem.

**Perfect for:** All code generators, writing TypeScript files, API client generation, file output.

**Key features:**
- Write files to disk
- Dry run mode for testing
- Clean output directories
- Pre-write hooks for validation

## Usage

Register the fs plugin to enable file writing.

**Example:** Write files with directory cleanup.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: false,
  clean: { path: './generated' },
})
```

## Plugin Options

### dryRun

Controls whether files are actually written to disk. When `true`, files are processed but not written.

> [!TIP]
> Use `dryRun: true` for testing file generation without creating files on disk.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

**Example:**

```ts
fabric.use(fsPlugin, {
  dryRun: true, // Files processed but not written
})
```

### onBeforeWrite

Callback function called right before each file is written. Use this to log, validate, or transform file content.

|           |                                                                 |
|----------:|:----------------------------------------------------------------|
|     Type: | `(path: string, data: string \| undefined) => void \| Promise<void>` |
| Required: | `false`                                                         |

**Example:**

```ts
fabric.use(fsPlugin, {
  onBeforeWrite: (path, data) => {
    console.log(`Writing: ${path} (${data?.length || 0} bytes)`)
  },
})
```

### clean

Removes the specified directory before writing files. Use this to ensure a clean output directory.

> [!WARNING]
> The clean operation permanently deletes the directory and all its contents.

|           |                     |
|----------:|:--------------------|
|     Type: | `{ path: string }`  |
| Required: | `false`             |

**Example:**

```ts
fabric.use(fsPlugin, {
  clean: { path: './generated' }, // Removes ./generated before writing
})
```

## Injected Methods

The `fsPlugin` adds the `write()` method to the Fabric instance.

### `fabric.write()`

Writes all queued files to disk.

```ts
fabric.write(options?: WriteOptions): Promise<void>
```

**Parameters:**

#### extension

Maps input file extensions to output extensions. When set, the matching parser (by extNames) is used.

|           |                                  |
|----------:|:---------------------------------|
|     Type: | `Record<Extname, Extname \| ''>` |
| Required: | `false`                          |

**Example:**

```ts
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

## Examples

### Basic File Writing

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
  imports: [],
  exports: []
})

await fabric.write()
```

### Clean Before Writing

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  clean: { path: './output' }, // Remove ./output directory first
})

fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  sources: [
    { value: 'export const API_URL = "https://api.example.com"', isExportable: true },
  ],
  imports: [],
  exports: []
})

await fabric.write()
```

### Dry Run for Testing

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: true, // Test without writing files
  onBeforeWrite: (path, data) => {
    console.log(`Would write: ${path}`)
  },
})

await fabric.addFile({
  baseName: 'test.ts',
  path: './output/test.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
// No files written to disk
```


### Extension Mapping

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser, tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)
fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'component.tsx',
  path: './output/component.tsx',
  sources: [/* ... */],
  imports: [],
  exports: [],
})

// Map .tsx to .tsx (use tsxParser)
await fabric.write({
  extension: {
    '.tsx': '.tsx',
  },
})
```

## Events

The `fsPlugin` listens to the following events:

- `file:processing:update` — Writes each file to disk
- `files:writing:start` — Cleans output directory (if configured)

## Best Practices

### Clean Output Directory

Always clean the output directory to avoid stale files:

```ts
fabric.use(fsPlugin, {
  clean: { path: './output' },
})
```

### Use Dry Run for Testing

Test your generator without creating files:

```ts
fabric.use(fsPlugin, {
  dryRun: process.env.DRY_RUN === 'true',
})
```

### Validate Before Writing

Use `onBeforeWrite` to validate content:

```ts
fabric.use(fsPlugin, {
  onBeforeWrite: (path, data) => {
    if (!data) throw new Error(`Empty file: ${path}`)
  },
})
```

## See Also

- [createFabric](/core/create-fabric) — Create a Fabric instance
- [typescriptParser](/parsers/typescript-parser) — Parse TypeScript files
- [Events](/core/events) — Lifecycle events
