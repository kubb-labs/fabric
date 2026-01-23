---
layout: doc
title: fsPlugin
outline: deep
---

# fsPlugin

Writes files to disk and provides file system operations for Fabric.

## Installation

The `fsPlugin` is included in `@kubb/fabric-core`:

```ts [import.ts]
import { fsPlugin } from '@kubb/fabric-core/plugins'
```

## Usage

```ts [basic-usage.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: false,
  clean: { path: './generated' },
})
```

## Options

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

```ts [dry-run.ts]
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

```ts [on-before-write.ts]
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

```ts [clean.ts]
fabric.use(fsPlugin, {
  clean: { path: './generated' }, // Removes ./generated before writing
})
```

## Injected Methods

The `fsPlugin` adds the `write()` method to the Fabric instance.

### fabric.write()

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

```ts [write-with-extension.ts]
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

## Examples

### Basic File Writing

```ts [basic-writing.ts]
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
})

await fabric.write()
```

### Clean Before Writing

```ts [clean-example.ts]
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
})

await fabric.write()
```

### Dry Run for Testing

```ts [dry-run-example.ts]
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
})

await fabric.write()
// No files written to disk
```

### Pre-Write Validation

```ts [validation-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  onBeforeWrite: async (path, data) => {
    // Validate file content
    if (!data || data.length === 0) {
      throw new Error(`Empty file: ${path}`)
    }
    
    // Log file size
    const sizeKB = (data.length / 1024).toFixed(2)
    console.log(`Writing ${path} (${sizeKB} KB)`)
  },
})

await fabric.write()
```

### Extension Mapping

```ts [extension-mapping-example.ts]
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
})

// Map .tsx to .tsx (use tsxParser)
await fabric.write({
  extension: {
    '.tsx': '.tsx',
  },
})
```

### Environment-Based Configuration

```ts [env-config.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

const isDev = process.env.NODE_ENV === 'development'

fabric.use(fsPlugin, {
  dryRun: isDev, // Dry run in development
  clean: { path: './output' },
  onBeforeWrite: (path) => {
    if (isDev) {
      console.log(`[DEV] Writing: ${path}`)
    }
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

- [createFabric](/api/core/create-fabric) — Create a Fabric instance
- [typescriptParser](/api/parsers/typescript-parser) — Parse TypeScript files
- [Events](/api/core/events) — Lifecycle events
