---
layout: doc
title: Configure
outline: deep
---

# Configure

Learn how to configure Fabric for your project.

## Basic Configuration

Fabric is configured through code using the `createFabric()` function and plugin options.
There is no separate configuration file required.

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

## Plugin Configuration

Each plugin accepts its own configuration options when registered with `fabric.use()`.

### File System Plugin

Controls file writing behavior:

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

### Logger Plugin

Configures progress tracking and websocket server:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  progress: true,
  websocket: {
    host: 'localhost',
    port: 3000,
  },
})
```

### Barrel Plugin

Controls barrel file generation:

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

## Parser Configuration

Parsers are registered with `fabric.use()` and automatically selected based on file extensions during `fabric.write()`.

### TypeScript Parser

Handles `.ts` files:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(typescriptParser)
```

### TSX Parser

Handles `.tsx` files with JSX support:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(tsxParser)
```

## Extension Mapping

Control how file extensions are transformed during generation:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
// Map .vue files to .ts during generation
await fabric.write({
  extension: {
    '.vue': '.ts',
    '.tsx': '.tsx'
  }
})
```

When extension mapping is provided, Fabric selects the parser whose `extNames` match the file's extension.

## Event Listeners

Configure event listeners to react to lifecycle events:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
const fabric = createFabric()

fabric.context.on('lifecycle:start', async () => {
  console.log('Starting generation...')
})

fabric.context.on('file:processing:update', async ({ processed, total, percentage }) => {
  console.log(`Progress: ${percentage.toFixed(1)}%`)
})

fabric.context.on('files:writing:start', async ({ files }) => {
  console.log(`Writing ${files.length} files...`)
})

fabric.context.on('lifecycle:end', async () => {
  console.log('Generation complete!')
})
```

## Output Directory Structure

Organize generated files using path configuration:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()

// Clean before generation
fabric.use(fsPlugin, {
  clean: { path: './generated' },
})

async function create(){
  // Organize by feature
  await fabric.addFile({
    path: './generated/types/user.ts',
    baseName: 'user.ts',
    sources: [/* ... */],
    imports: [],
    exports: [],
  })

  await fabric.addFile({
    path: './generated/api/user-api.ts',
    baseName: 'user-api.ts',
    sources: [/* ... */],
    imports: [],
    exports: [],
  })
}

create()
```

## Best Practices

### Order Plugins Correctly

Register plugins in the correct order. The logger plugin should be registered first to capture all events:

```ts
// ✅ Correct order
fabric.use(loggerPlugin)
fabric.use(barrelPlugin)
fabric.use(fsPlugin)
fabric.use(typescriptParser)

// ❌ Incorrect - logger won't capture barrel plugin events
fabric.use(barrelPlugin)
fabric.use(loggerPlugin)
```
