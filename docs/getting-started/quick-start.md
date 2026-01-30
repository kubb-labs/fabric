---
layout: doc
title: Quick Start - Fabric JSX Code Generator Tutorial
description: Build your first TypeScript code generator with Fabric in 5 minutes. Step-by-step tutorial for file generation with JSX.
outline: deep
---

# Quick Start Guide: Build Your First Code Generator

Learn how to generate TypeScript files with Fabric in under 5 minutes. This tutorial covers basic file generation, multiple files, progress tracking, barrel files, and lifecycle events.

**What you'll build:** A code generator that creates TypeScript type definitions and constants.

**Prerequisites:** Node.js 20+ or Bun 1.0+, basic TypeScript knowledge.

## Step 1: Basic File Generation

Create a simple code generator script that outputs a TypeScript type definition file.

```ts twoslash [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

// Create a Fabric instance
const fabric = createFabric()

// Register the file system plugin
fabric.use(fsPlugin, {
  dryRun: false,
  clean: { path: './generated' },
})

// Register the TypeScript parser
fabric.use(typescriptParser)

// Add a file to generate
await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/user.ts',
  sources: [
    {
      value: 'export type User = { id: number; name: string }',
      isExportable: true
    },
  ],
  imports: [],
  exports: [],
})

// Write all files to disk
await fabric.write()
```

**Run the generator:**

::: code-group

```bash [bun]
bun generate.ts
```

```bash [node]
node --loader tsx generate.ts
```

:::

**Output:** Creates `generated/user.ts` with the User type definition.

```ts [generated/user.ts]
export type User = { id: number; name: string }
```

## Step 2: Generate Multiple Files

Create a generator that produces multiple related TypeScript files (types and constants).

```ts twoslash [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  clean: { path: './generated' },
})

fabric.use(typescriptParser)

// Add multiple files
await fabric.addFile({
  baseName: 'types.ts',
  path: './generated/types.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
    { value: 'export type Post = { id: number; title: string; userId: number }', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.addFile({
  baseName: 'constants.ts',
  path: './generated/constants.ts',
  sources: [
    { value: 'export const API_URL = "https://api.example.com"', isExportable: true },
    { value: 'export const API_VERSION = "v1"', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

**Output:** Two files are generated with proper formatting.

::: code-group

```ts [generated/constants.ts]
export const API_URL = "https://api.example.com"
export const API_VERSION = "v1"
```

```ts [generated/types.ts]
export type User = { id: number; name: string }
export type Post = { id: number; title: string; userId: number }
```

:::

## Step 3: Add Progress Tracking

Enable visual feedback during generation with the logger plugin. See real-time progress in your terminal.

```ts twoslash [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Add logger for progress tracking
fabric.use(loggerPlugin, {
  progress: true,
})

fabric.use(fsPlugin, {
  clean: { path: './generated' },
})

fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'api.ts',
  path: './generated/api.ts',
  sources: [
    { value: 'export const fetchUser = async (id: number) => {}', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

**Output:** A progress bar displays in the console showing generation status (e.g., "50% - 1/2 files").

## Step 4: Generate Barrel Files (Index Exports)

Automatically create `index.ts` files that re-export all generated modules for cleaner imports.

```ts twoslash [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, barrelPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})

fabric.use(fsPlugin, {
  clean: { path: './generated' },
})

fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/models/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.addFile({
  baseName: 'post.ts',
  path: './generated/models/post.ts',
  sources: [
    { value: 'export type Post = { id: number; title: string }', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()

// Generate entry barrel file
await fabric.writeEntry({ root: './generated', mode: 'named' })
```

**Output:** Four files are created:
- `generated/models/user.ts` - User type definition
- `generated/models/post.ts` - Post type definition
- `generated/models/index.ts` - Barrel file re-exporting User and Post
- `generated/index.ts` - Entry barrel re-exporting from models

**Usage:** Import from barrel files for cleaner code.
```ts
// Instead of: import { User } from './generated/models/user'
import { User, Post } from './generated/models'
```

## Step 5: Listen to Lifecycle Events

Hook into Fabric's event system to monitor generation progress, log activity, or trigger custom actions.

```ts twoslash [generate.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Listen to events
fabric.context.on('files:writing:start', () => {
  console.log('Writing files ...')
})

fabric.context.on('file:processing:update', ({ processed, total, percentage }) => {
  console.log(`Progress: ${percentage.toFixed(1)}% (${processed}/${total})`)
})

fabric.context.on('lifecycle:end', () => {
  console.log('Generation completed!')
})

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'output.ts',
  path: './generated/output.ts',
  sources: [
    { value: 'export const message = "Hello, Fabric!"', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

**Console output:**
```
Writing files ...
Progress: 100.0% (1/1)
Generation completed!
```

## Next Steps

Now that you've built a basic code generator, explore advanced features:

- [Configuration Guide](/getting-started/configure) - Configure plugins and parsers
- [Creating Plugins](/guide/creating-plugins) - Build custom Fabric plugins
- [Core Components](/core/components/file) - Use File, Function, and Type components
- [Parsers](/parsers) - Customize output formatting
- [Troubleshooting](/getting-started/troubleshooting) - Fix common issues

## FAQ

### How do I generate files without writing to disk?

Enable dry run mode in the fs plugin:
```ts
fabric.use(fsPlugin, { dryRun: true })
```

### Can I customize the output format?

Yes. Use custom parsers or the built-in TypeScript/TSX parsers. See [Creating Parsers](/guide/creating-parsers).

### How do I add imports to generated files?

Add import objects to the `imports` array when calling `addFile()`:
```ts
await fabric.addFile({
  baseName: 'api.ts',
  path: './generated/api.ts',
  imports: [
    { name: ['User'], path: './types', isTypeOnly: true }
  ],
  sources: [/* ... */],
  exports: []
})
```

### Where can I see all available plugins?

See the [Plugins documentation](/plugins) for a complete list of built-in plugins.

## Related Resources

- [Installation](/getting-started/installation) - Install Fabric packages
- [Introduction](/getting-started/introduction) - Learn about Fabric architecture
- [React Fabric](/react) - Use React components for code generation
