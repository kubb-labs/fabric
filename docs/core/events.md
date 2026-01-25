---
layout: doc
title: Events
outline: deep
---

# Events

Fabric emits events throughout its lifecycle that plugins and custom code can listen to. These events provide hooks for monitoring progress, transforming files, and performing custom operations.

## Listening to Events

Access the event emitter through `fabric.context.events` or `fabric.context.on()`:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()

fabric.context.on('lifecycle:start', async () => {
  console.log('Fabric execution started')
})

fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  console.log(`Progress: ${percentage.toFixed(1)}% (${processed}/${total})`)
})

fabric.context.on('lifecycle:end', async () => {
  console.log('Fabric execution completed')
})
```

## Quick Reference

| Event | When | Payload | Common Use |
|:------|:-----|:--------|:-----------|
| `lifecycle:start` | Generation begins | None | Initialize resources, start timers |
| `lifecycle:end` | Generation completes | None | Cleanup, final logging, stop timers |
| `lifecycle:render` | Rendering starts | `{ fabric }` | React rendering setup |
| `files:added` | Files added to cache | `{ files }` | Track added files |
| `file:resolve:path` | Path resolution | `{ file }` | Modify file paths |
| `file:resolve:name` | Name resolution | `{ file }` | Modify file names |
| `files:writing:start` | Before writing files | `{ files }` | Validation, file transformation |
| `files:writing:end` | After writing files | `{ files }` | Post-processing, notifications |
| `files:processing:start` | Before processing | `{ files }` | Processing setup |
| `file:processing:start` | File processing starts | `{ file, index, total }` | Per-file logging |
| `file:processing:update` | Processing progress | `{ file, source, processed, percentage, total }` | Progress bars |
| `file:processing:end` | File processing ends | `{ file, index, total }` | Per-file completion |
| `files:processing:end` | All processing ends | `{ files }` | Processing summary |

## Event Categories

Events are organized into categories based on their purpose.

### Lifecycle Events

Track the overall execution lifecycle of Fabric.

#### `lifecycle:start`

Emitted when Fabric begins execution.

```ts [lifecycle-start.ts]
fabric.context.on('lifecycle:start', async () => {
  console.log('Starting Fabric...')
})
```

#### `lifecycle:end`

Emitted when Fabric completes execution.

```ts [lifecycle-end.ts]
fabric.context.on('lifecycle:end', async () => {
  console.log('Fabric completed!')
})
```

#### `lifecycle:render`

Emitted when rendering starts (requires `reactPlugin`).

```ts [lifecycle-render.ts]
fabric.context.on('lifecycle:render', async ({ fabric }) => {
  console.log('Rendering started')
})
```

**Payload:**

|        |          |                          |
|-------:|:---------|:-------------------------|
| fabric | `Fabric` | The Fabric instance      |

### File Management Events

Track when files are added or modified.

#### `files:added`

Emitted when files are added to the FileManager cache.

```ts [files-added.ts]
fabric.context.on('files:added', async (files) => {
  console.log(`Added ${files.length} files`)
})
```

**Payload:**

|       |                   |                     |
|------:|:------------------|:--------------------|
| files | `KubbFile.File[]` | Array of added files |

#### `file:resolve:path`

Emitted during file path resolution. Listeners can modify the file's path.

```ts [file-resolve-path.ts]
fabric.context.on('file:resolve:path', async ({ file }) => {
  console.log(`Resolving path for: ${file.baseName}`)
  // Optionally modify file.path here
})
```

**Payload:**

|      |                 |                                |
|-----:|:----------------|:-------------------------------|
| file | `KubbFile.File` | File being processed           |

#### `file:resolve:name`

Emitted during file name resolution. Listeners can modify the file's name.

```ts [file-resolve-name.ts]
fabric.context.on('file:resolve:name', async ({ file }) => {
  console.log(`Resolving name for: ${file.path}`)
  // Optionally modify file.baseName here
})
```

**Payload:**

|      |                 |                                |
|-----:|:----------------|:-------------------------------|
| file | `KubbFile.File` | File being processed           |

### File Writing Events

Track when files are written to disk.

#### `files:writing:start`

Emitted before writing files to disk.

```ts [files-writing-start.ts]
fabric.context.on('files:writing:start', async (files) => {
  console.log(`Preparing to write ${files.length} files`)
})
```

**Payload:**

|       |                   |                         |
|------:|:------------------|:------------------------|
| files | `KubbFile.File[]` | Files to be written     |

#### `files:writing:end`

Emitted after files are written to disk.

```ts [files-writing-end.ts]
fabric.context.on('files:writing:end', async (files) => {
  console.log(`Finished writing ${files.length} files`)
})
```

**Payload:**

|       |                   |                     |
|------:|:------------------|:--------------------|
| files | `KubbFile.File[]` | Files that were written |

### File Processing Events

Track individual file processing progress.

#### `files:processing:start`

Emitted before processing begins.

```ts [files-processing-start.ts]
fabric.context.on('files:processing:start', async (files) => {
  console.log(`Processing ${files.length} files...`)
})
```

**Payload:**

|       |                   |                       |
|------:|:------------------|:----------------------|
| files | `KubbFile.File[]` | Files to be processed |

#### `file:processing:start`

Emitted when each file starts processing.

```ts [file-processing-start.ts]
fabric.context.on('file:processing:start', async ({ file, index, total }) => {
  console.log(`Processing file ${index + 1}/${total}: ${file.baseName}`)
})
```

**Payload:**

|       |                 |                              |
|------:|:----------------|:-----------------------------|
|  file | `KubbFile.File` | File being processed         |
| index | `number`        | Zero-based index of file     |
| total | `number`        | Total number of files        |

#### `file:processing:update`

Emitted with progress updates during file processing.

```ts [file-processing-update.ts]
fabric.context.on('file:processing:update', async ({
  file,
  source,
  processed,
  percentage,
  total
}) => {
  console.log(`Progress: ${percentage.toFixed(1)}%`)
})
```

**Payload:**

|            |                 |                                        |
|-----------:|:----------------|:---------------------------------------|
|       file | `KubbFile.File` | File being processed                   |
|     source | `string`        | Current processed source               |
|  processed | `number`        | Number of files processed              |
| percentage | `number`        | Processing percentage (0-100)          |
|      total | `number`        | Total number of files                  |

#### `file:processing:end`

Emitted when each file finishes processing.

```ts [file-processing-end.ts]
fabric.context.on('file:processing:end', async ({ file, index, total }) => {
  console.log(`Completed ${index + 1}/${total}: ${file.baseName}`)
})
```

**Payload:**

|       |                 |                          |
|------:|:----------------|:-------------------------|
|  file | `KubbFile.File` | File that was processed  |
| index | `number`        | Zero-based index of file |
| total | `number`        | Total number of files    |

#### `files:processing:end`

Emitted when all processing completes.

```ts [files-processing-end.ts]
fabric.context.on('files:processing:end', async (files) => {
  console.log(`All ${files.length} files processed`)
})
```

**Payload:**

|       |                   |                           |
|------:|:------------------|:--------------------------|
| files | `KubbFile.File[]` | All processed files       |

## Event Patterns

### Progress Tracking

Track generation progress:

```ts [progress-tracking.ts]
let startTime: number

fabric.context.on('lifecycle:start', async () => {
  startTime = Date.now()
  console.log('Starting generation...')
})

fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`[${elapsed}s] ${percentage.toFixed(1)}% (${processed}/${total})`)
})

fabric.context.on('lifecycle:end', async () => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`Completed in ${elapsed}s`)
})
```

### File Transformation

Modify files during processing:

```ts [file-transformation.ts]
fabric.context.on('file:resolve:path', async ({ file }) => {
  // Normalize paths to use forward slashes
  file.path = file.path.replace(/\\/g, '/')
})

fabric.context.on('file:resolve:name', async ({ file }) => {
  // Add .generated suffix to file names
  const ext = path.extname(file.baseName)
  const name = path.basename(file.baseName, ext)
  file.baseName = `${name}.generated${ext}`
})
```

### Error Handling

Handle errors during file operations:

```ts [error-handling.ts]
fabric.context.on('files:writing:start', async (files) => {
  try {
    // Pre-write validation
    for (const file of files) {
      if (!file.path) {
        throw new Error(`File missing path: ${file.baseName}`)
      }
    }
  } catch (error) {
    console.error('Validation error:', error)
    throw error
  }
})
```

### Custom Logging

Build custom logging solutions:

```ts [custom-logging.ts]
const log = {
  files: [] as string[],
  start: 0,
}

fabric.context.on('lifecycle:start', async () => {
  log.start = Date.now()
})

fabric.context.on('file:processing:end', async ({ file }) => {
  log.files.push(file.path)
})

fabric.context.on('lifecycle:end', async () => {
  console.log('Generation Report:')
  console.log(`- Duration: ${Date.now() - log.start}ms`)
  console.log(`- Files: ${log.files.length}`)
  log.files.forEach(f => console.log(`  - ${f}`))
})
```

## Example

Here's a comprehensive example using multiple events:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Lifecycle tracking
let stats = {
  startTime: 0,
  filesAdded: 0,
  filesProcessed: 0,
  filesWritten: 0,
}

fabric.context.on('lifecycle:start', () => {
  stats.startTime = Date.now()
  console.log('🚀 Generation started')
})

fabric.context.on('files:added', (files) => {
  stats.filesAdded += files.length
  console.log(`📁 Added ${files.length} files (total: ${stats.filesAdded})`)
})

fabric.context.on('file:processing:update', ({ processed, total, percentage }) => {
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
  process.stdout.write(`\r${bar} ${percentage.toFixed(1)}% (${processed}/${total})`)
})

fabric.context.on('files:writing:start', (files) => {
  stats.filesWritten = files.length
  console.log(`\n📝 Writing ${files.length} files...`)
})

fabric.context.on('files:writing:end', (files) => {
  console.log(`✓ Wrote ${files.length} files`)
})

fabric.context.on('lifecycle:end', () => {
  const elapsed = Date.now() - stats.startTime
  console.log('\n✨ Generation complete!')
  console.log(`   Time: ${elapsed}ms`)
  console.log(`   Files: ${stats.filesWritten}`)
})

// Configure and run
fabric.use(fsPlugin, { clean: { path: './generated' } })
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/user.ts',
  sources: [{ value: 'export type User = {}', isExportable: true }],
  imports: [],
  exports: []
})

await fabric.write({ extension: { '.ts': '.ts' } })
```

## See Also

- [createFabric](/core/create-fabric) — Create a Fabric instance
- [loggerPlugin](/plugins/logger-plugin) — Built-in event logging
- [Event System](/guide/event-system) — Event system explained
- [Creating Plugins](/guide/creating-plugins) — Build plugins with events
