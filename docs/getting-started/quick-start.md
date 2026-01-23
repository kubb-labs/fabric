---
layout: doc
title: Quick Start
outline: deep
---

# Quick Start

Build your first code generator with Fabric in minutes.

## Basic File Generation

Create a simple script that generates a TypeScript file:

```ts [generate.ts]
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

```ts [generate-multiple.ts]
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
})

await fabric.addFile({
  baseName: 'constants.ts',
  path: './generated/constants.ts',
  sources: [
    { value: 'export const API_URL = "https://api.example.com"', isExportable: true },
    { value: 'export const API_VERSION = "v1"', isExportable: true },
  ],
})

await fabric.write()
```

## Using the Logger Plugin

Add progress tracking and visual feedback:

```ts [generate-with-logger.ts]
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
})

await fabric.write()
```

The logger displays a progress bar and beautiful CLI output during generation.

## Generating Barrel Files

Use the barrel plugin to automatically create index files:

```ts [generate-barrels.ts]
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
})

await fabric.addFile({
  baseName: 'post.ts',
  path: './generated/models/post.ts',
  sources: [
    { value: 'export type Post = { id: number; title: string }', isExportable: true },
  ],
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

```ts [generate-with-events.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

// Listen to events
fabric.context.on('lifecycle:start', () => {
  console.log('Generation started...')
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
})

await fabric.write()
```

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/getting-started/configuration" class="vp-card">
      <h3>Configuration</h3>
      <p>Learn about configuration options</p>
    </a>
    <a href="/guide/creating-plugins" class="vp-card">
      <h3>Creating Plugins</h3>
      <p>Build custom plugins</p>
    </a>
    <a href="/tutorials/building-code-generator" class="vp-card">
      <h3>Tutorials</h3>
      <p>Step-by-step guides</p>
    </a>
  </div>
</div>
