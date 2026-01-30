---
layout: doc
title: Fabric Events API - Lifecycle Event Hooks Reference
description: Listen to Fabric lifecycle events for progress tracking, file transformation, and custom operations. Complete event reference.
outline: deep
---

# Fabric Events API Reference

Fabric emits lifecycle events throughout file generation that you can listen to for progress tracking, file transformation, logging, and custom operations.

**Use events to:**
- Track generation progress with progress bars
- Transform files before writing (modify paths, names, content)
- Log generation activity
- Trigger custom operations at specific lifecycle points

**Access events via:** `fabric.context.on(eventName, handler)`

## How to Listen to Events

Access the event emitter through `fabric.context.on()` or `fabric.context.events.on()`.

**Example:** Listen to lifecycle events.

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

**Event handlers can be async:**
```ts
fabric.context.on('lifecycle:start', async () => {
  await initializeDatabase()
  console.log('Database ready')
})
```

## Event Reference Quick Guide

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

Events are organized by their purpose in the generation lifecycle.

### 1. Lifecycle Events

Track overall Fabric execution from start to finish.

**Events:**
- `lifecycle:start` - Generation begins
- `lifecycle:end` - Generation completes
- `lifecycle:render` - Rendering starts (FSX/React)

#### lifecycle:start

Emitted when Fabric begins execution. Use for initializing resources or starting timers.

**Payload:** None

**Example:**

```ts
fabric.context.on('lifecycle:start', async () => {
  console.log('Starting Fabric...')
})
```

#### lifecycle:end

Emitted when Fabric completes execution. Use for cleanup, final logging, or stopping timers.

**Payload:** None

**Example:**
fabric.context.on('lifecycle:end', async () => {
  console.log('Fabric completed!')
})
```

#### `lifecycle:render`

Emitted when rendering starts (requires `reactPlugin` or `fsxPlugin`).

```ts
fabric.context.on('lifecycle:render', async ({ fabric }) => {
  console.log('Rendering started')
})
```

**Payload:**

|        |          |                          |
|-------:|:---------|:-------------------------|
| fabric | `Fabric` | The Fabric instance      |

### 2. File Management Events

Track when files are added or paths/names are resolved.

**Events:**
- `files:added` - Files added to cache
- `file:resolve:path` - Path resolution (can modify)
- `file:resolve:name` - Name resolution (can modify)

#### `files:added`

Emitted when files are added to the FileManager cache.

```ts
fabric.context.on('files:added', async (files) => {
  console.log(`Added ${files.length} files`)
```ts
fabric.context.on('files:added', async (files) => {
  console.log(`Added ${files.length} files`)
})
```

#### file:resolve:path

Emitted during file path resolution. Listeners can modify `file.path`.

**Payload:**

|      |                 |                                |
|-----:|:----------------|:-------------------------------|
| file | `KubbFile.File` | File being processed           |

**Example:** Normalize paths to use forward slashes.
fabric.context.on('file:resolve:path', async ({ file }) => {
```ts
fabric.context.on('file:resolve:path', async ({ file }) => {
  file.path = file.path.replace(/\\/g, '/')
})
```

#### file:resolve:name

Emitted during file name resolution. Listeners can modify `file.baseName`.

**Payload:**

|      |                 |                                |
|-----:|:----------------|:-------------------------------|
| file | `KubbFile.File` | File being processed           |

**Example:** Add `.generated` suffix to file names.
fabric.context.on('file:resolve:name', async ({ file }) => {
  console.log(`Resolving name for: ${file.path}`)
  // Optionally modify file.baseName here
})
```

**Payload:**

|      |                 |                                |
|-----:|:----------------|:-------------------------------|
| file | `KubbFile.File` | File being processed           |

### 3. File Writing Events

Track when files are written to disk.

**Events:**
- `files:writing:start` - Before writing files
- `files:writing:end` - After writing files

#### `files:writing:start`

Emitted before writing files to disk.

```ts
fabric.context.on('files:writing:start', async (files) => {
  console.log(`Preparing to write ${files.length} files`)
```ts
fabric.context.on('files:writing:start', async (files) => {
  console.log(`Preparing to write ${files.length} files`)
})
```

#### files:writing:end

Emitted after files are written to disk. Use for post-processing or notifications.

**Payload:**

|       |                   |                     |
|------:|:------------------|:--------------------|
| files | `KubbFile.File[]` | Files that were written |

**Example:**
fabric.context.on('files:writing:end', async (files) => {
  console.log(`Finished writing ${files.length} files`)
})
```

**Payload:**

|       |                   |                     |
|------:|:------------------|:--------------------|
| files | `KubbFile.File[]` | Files that were written |

### 4. File Processing Events

Track individual file processing progress and status.

**Events:**
- `files:processing:start` - Processing begins
- `file:processing:start` - Each file starts
- `file:processing:update` - Progress updates
- `file:processing:end` - Each file completes
- `files:processing:end` - All processing done

## Event Details

### Lifecycle Events

#### `files:processing:start`

Emitted before processing begins.

```ts
fabric.context.on('files:processing:start', async (files) => {
  console.log(`Processing ${files.length} files...`)
```ts
fabric.context.on('files:processing:start', async (files) => {
  console.log(`Processing ${files.length} files...`)
})
```

#### file:processing:start

Emitted when each individual file starts processing.

**Payload:**

|       |                 |                              |
|------:|:----------------|:-----------------------------|
|  file | `KubbFile.File` | File being processed         |
| index | `number`        | Zero-based index of file     |
| total | `number`        | Total number of files        |

**Example:**
fabric.context.on('file:processing:start', async ({ file, index, total }) => {
  console.log(`Processing file ${index + 1}/${total}: ${file.baseName}`)
```ts
fabric.context.on('file:processing:start', async ({ file, index, total }) => {
  console.log(`Processing file ${index + 1}/${total}: ${file.baseName}`)
})
```

#### file:processing:update

Emitted with progress updates during file processing. Use for progress bars.

**Payload:**

|            |                 |                                        |
|-----------:|:----------------|:---------------------------------------|
|       file | `KubbFile.File` | File being processed                   |
|     source | `string`        | Current processed source               |
|  processed | `number`        | Number of files processed              |
| percentage | `number`        | Processing percentage (0-100)          |
|      total | `number`        | Total number of files                  |

**Example:** Display a progress bar.
fabric.context.on('file:processing:update', async ({
  file,
  source,
  processed,
  percentage,
  total
}) => {
```ts
fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  const bar = '█'.repeat(Math.floor(percentage / 5))
  process.stdout.write(`\r${bar} ${percentage.toFixed(1)}% (${processed}/${total})`)
})
```

#### file:processing:end

Emitted when each file finishes processing.

**Payload:**

|       |                 |                          |
|------:|:----------------|:-------------------------|
|  file | `KubbFile.File` | File that was processed  |
| index | `number`        | Zero-based index of file |
| total | `number`        | Total number of files    |

**Example:**
fabric.context.on('file:processing:end', async ({ file, index, total }) => {
  console.log(`Completed ${index + 1}/${total}: ${file.baseName}`)
```ts
fabric.context.on('file:processing:end', async ({ file, index, total }) => {
  console.log(`Completed ${index + 1}/${total}: ${file.baseName}`)
})
```

#### files:processing:end

Emitted when all file processing completes.

**Payload:**

|       |                   |                           |
|------:|:------------------|:--------------------------|
| files | `KubbFile.File[]` | All processed files       |

**Example:**
fabric.context.on('files:processing:end', async (files) => {
  console.log(`All ${files.length} files processed`)
```ts
fabric.context.on('files:processing:end', async (files) => {
  console.log(`All ${files.length} files processed`)
})
```

## Common Event Patterns

### Pattern 1: Progress Tracking

Track generation progress with timing and percentage.

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

### Pattern 2: File Transformation

Modify files during generation by listening to resolve events.

```ts [file-transformation.ts]
import { extname, basename } from 'path'

fabric.context.on('file:resolve:path', async ({ file }) => {
  // Normalize paths to use forward slashes
  file.path = file.path.replace(/\\/g, '/')
})

fabric.context.on('file:resolve:name', async ({ file }) => {
  // Add .generated suffix to file names
  const ext = extname(file.baseName)
  const name = basename(file.baseName, ext)
  file.baseName = `${name}.generated${ext}`
})
```

### Pattern 3: Custom Logging

Build custom logging and reporting solutions.

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

## Complete Example

Comprehensive example using multiple events for progress tracking and logging.

**Example:**

::: code-group

```ts twoslash [run.ts]
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

```bash [output]
📁 Added 1 files (total: 1)

📝 Writing 1 files...
████████████████████ 100.0% (1/1)
✓ Wrote 1 files

✨ Generation complete!
   Time: 150ms
   Files: 1
```

:::

## Next Steps

- [createFabric API](/core/create-fabric) - Create Fabric instances
- [logger Plugin](/plugins/logger-plugin) - Built-in event logging
- [Creating Plugins](/guide/creating-plugins) - Build plugins with events

## FAQ

### When are events emitted?

Events are emitted at specific points during the generation lifecycle. See the [Event Reference Quick Guide](#event-reference-quick-guide) table.

### Can I modify files in event handlers?

Yes, in `file:resolve:path` and `file:resolve:name` events, you can modify `file.path` and `file.baseName`.

### Are event handlers async?

Yes, event handlers can be async functions. Fabric awaits all handlers before continuing.

### Can I stop file generation from an event?

No, events are for monitoring and transformation only. They cannot cancel generation.

### How do I remove an event listener?

Use `fabric.context.off(eventName, handler)` or `fabric.context.events.off()`.

## Related Resources

- [Core API](/core) - Fabric Core overview
- [Plugins](/plugins) - Plugin documentation
- [Composables](/core/composables/use-lifecycle) - useLifecycle hook
