---
layout: doc
title: Configure Fabric - Plugin & Parser Setup Guide
description: Configure Fabric plugins (fs, logger, barrel) and parsers (TypeScript, TSX) for code generation. Learn event listeners and best practices.
outline: deep
---

# Configuration Guide

Configure Fabric's plugins, parsers, and lifecycle events to customize your code generation workflow.

**What you'll learn:**
- How to configure plugins (fs, logger, barrel)
- How to register parsers for different file types
- How to set up event listeners
- Best practices for plugin ordering

## How Fabric Configuration Works

Fabric uses **code-based configuration** through the `createFabric()` function and plugin options. No separate config file is needed.

**Configuration happens in three steps:**
1. Create a Fabric instance with `createFabric()`
2. Register plugins with `fabric.use(plugin, options)`
3. Register parsers with `fabric.use(parser)`

**Example:** Basic Fabric configuration with plugins and parsers.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Configure plugins
fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin, { clean: { path: './output' } })
fabric.use(typescriptParser)
```

## Configure Plugins

Each plugin accepts custom options when registered. Plugins add functionality like file writing, logging, or barrel file generation.

### File System Plugin (fsPlugin)

Controls how files are written to disk, including dry run mode and cleanup.

**Common options:**
- `dryRun` - Test generation without writing files
- `clean` - Delete directory before generating
- `onBeforeWrite` - Hook before writing each file

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: false,
  onBeforeWrite: (path, data) => {
    console.log(`Writing: ${path}`)
  },
  clean: { path: './generated' },
})
```

**Learn more:** [Fs Plugin Documentation](/plugins/fs-plugin)

### Logger Plugin (loggerPlugin)

Displays progress bars, percentage completion

**Common options:**
- `progress` - Enable progress bar display

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
})
```

**Learn more:** [Logger Plugin Documentation](/plugins/logger-plugin)

### Barrel Plugin (barrelPlugin)

Automatically generates `index.ts` files that re-export all modules in a directory for cleaner imports.

**Common options:**
- `root` - Base directory for barrel files
- `mode` - Export mode: `'named'` or `'default'`
- `dryRun` - Test barrel generation without writing

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './src/generated',
  mode: 'named',
  dryRun: false,
})
```

**Learn more:** [Barrel Plugin Documentation](/plugins/barrel-plugin)

## Configure Parsers

Parsers convert file objects to strings during `fabric.write()`. Fabric automatically selects the correct parser based on file extension.

**How parser selection works:**
1. Fabric checks the file extension (e.g., `.ts`, `.tsx`)
2. Selects the parser whose `extNames` match the extension
3. Calls the parser's `parse()` function to generate file content

### TypeScript Parser (typescriptParser)

Parses `.ts` files with TypeScript formatting, import statements, and export declarations.

**Handles:** Type definitions, interfaces, constants, functions

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(typescriptParser)
```

**Learn more:** [TypeScript Parser Documentation](/parsers/typescript-parser)

### TSX Parser (tsxParser)

Parses `.tsx` files with JSX syntax support for React components.

**Handles:** JSX/TSX components, React component files

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(tsxParser)
```

**Learn more:** [TSX Parser Documentation](/parsers/tsx-parser)

## Map File Extensions

Control how file extensions are transformed during generation. Useful when source extension differs from output extension.

**Example:** Generate `.ts` files from `.vue` source files.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin)
// Map .vue files to .ts during generation
await fabric.write({
  extension: {
    '.vue': '.ts',
    '.tsx': '.tsx'
  }
})
```
>**How it works:**
- Files with `.vue` extension are transformed to `.ts` during generation
- Fabric selects the parser whose `extNames` include the mapped extension
- Original file objects remain unchanged

## Set Up Event Listeners

React to Fabric lifecycle events to log progress, transform files, or trigger custom actions.

**Common events:**
- `lifecycle:start` - Generation begins
- `file:processing:update` - File processing progress update
- `files:writing:start` - Before writing files to disk
- `lifecycle:end` - Generation complete

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
const fabric = createFabric()

fabric.context.on('lifecycle:start', async () => {
  console.log('Starting generation...')
})

fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  console.log(`Progress: ${percentage.toFixed(1)}%`)
})

fabric.context.on('files:writing:start', async (files) => {
  console.log(`Writing ${files.length} files...`)
})

fabric.context.on('lifecycle:end', async () => {
  console.log('Generation complete!')
})
```

**Learn more:** [Event System Documentation](/core/events)

## Configuration Best Practices

### 1. Order Plugins Correctly

Register plugins in the correct order. Event listeners (like logger) should be registered **first** to capture all events.

**✅ Correct order:**

```ts
// ✅ Correct: logger captures all events
fabric.use(loggerPlugin)
fabric.use(barrelPlugin)
fabric.use(fsPlugin)
fabric.use(typescriptParser)
```

**❌ Incorrect order:**
```ts
// ❌ Wrong: logger won't capture barrel plugin events
fabric.use(barrelPlugin)
fabric.use(loggerPlugin)
```

### 2. Use Dry Run for Testing

Test your generator without writing files by enabling dry run mode.

```ts
fabric.use(fsPlugin, { dryRun: true })
await fabric.write()
console.log('Would generate:', fabric.files.length, 'files')
```

### 3. Clean Output Directories

Prevent stale files from previous runs by configuring directory cleanup.

```ts
fabric.use(fsPlugin, {
  clean: { path: './generated' } // Deletes ./generated before writing
})
```

## Next Steps

- [Core API](/core) - Explore Fabric components
- [Creating Plugins](/guide/creating-plugins) - Build custom plugins
- [Events Reference](/core/events) - Complete event list

## FAQ

### When should I use dry run mode?

Use `dryRun: true` when testing generators or debugging file generation logic without modifying the filesystem.

### Can I use multiple parsers?

Yes. Register multiple parsers, and Fabric will select the correct one based on file extension:
```ts
fabric.use(typescriptParser)  // Handles .ts files
fabric.use(tsxParser)          // Handles .tsx files
```

### How do I debug which parser is used?

Listen to the `file:processing:update` event to see which files are being processed:
```ts
fabric.context.on('file:processing:update', ({ processed, total }) => {
  console.log(`Processing file ${processed}/${total}`)
})
```

### What happens if no parser matches a file extension?

Fabric falls back to the default parser, which outputs plain text. Register a custom parser or use the default parser explicitly.

## Related Resources

- [Plugin Reference](/plugins) - All available plugins
- [Parser Reference](/parsers) - All available parsers
- [Troubleshooting](/getting-started/troubleshooting) - Fix common configuration issues
