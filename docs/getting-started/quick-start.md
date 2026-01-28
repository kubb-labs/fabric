---
layout: doc
title: Quick Start
outline: deep
---

# Quick Start

Build your first code generator with Fabric in minutes.

## Basic File Generation

Create a simple script that generates a TypeScript file:

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

Run the script:

::: code-group

```bash [bun]
bun generate.ts
```

```bash [node]
node --loader tsx generate.ts
```

:::

This creates `generated/user.ts`:

```ts [generated/user.ts]
export type User = { id: number; name: string }
```

## Adding Multiple Files

Generate multiple related files:

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

This creates `generated/types.ts` and `generated/constants.ts`:

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

## Using the Logger Plugin

Add progress tracking and visual feedback:

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

The logger displays a progress bar with percentage completion in the console during generation.

## Generating Barrel Files

Use the barrel plugin to automatically create index files:

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
await fabric.writeEntry('./generated', 'named')
```

This creates:
- `generated/models/user.ts`
- `generated/models/post.ts`
- `generated/models/index.ts` (barrel file)
- `generated/index.ts` (entry barrel)

## Listening to Events

React to lifecycle events:

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

This will log:
```
Writing files ...
Progress: 100.0% (1/1)
Generation completed!
```
