---
layout: doc
title: Configure
outline: deep
---

# Configure

Learn how to configure Fabric for your project.

## Basic Configuration

Fabric is configured through code using the `createFabric()` function and plugin options. There is no separate configuration file required.

```ts [fabric-setup.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, loggerPlugin } from '@kubb/core/plugins'
import { typescriptParser } from '@kubb/core/parsers'

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

```ts [fs-plugin-config.ts]
import { fsPlugin } from '@kubb/core/plugins'

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

```ts [logger-plugin-config.ts]
import { loggerPlugin } from '@kubb/core/plugins'

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

```ts [barrel-plugin-config.ts]
import { barrelPlugin } from '@kubb/core/plugins'

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

```ts [typescript-parser-config.ts]
import { typescriptParser } from '@kubb/core/parsers'

fabric.use(typescriptParser)
```

### TSX Parser

Handles `.tsx` files with JSX support:

```ts [tsx-parser-config.ts]
import { tsxParser } from '@kubb/core/parsers'

fabric.use(tsxParser)
```

### Multiple Parsers

Register multiple parsers for different file types:

```ts [multiple-parsers-config.ts]
import { typescriptParser, tsxParser } from '@kubb/core/parsers'

fabric.use(typescriptParser)
fabric.use(tsxParser)

// Fabric selects the parser based on file extension
await fabric.write({ extension: { '.tsx': '.tsx', '.ts': '.ts' } })
```

## Extension Mapping

Control how file extensions are transformed during generation:

```ts [extension-mapping.ts]
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

```ts [event-listeners-config.ts]
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

```ts [output-structure.ts]
// Organize by feature
await fabric.addFile({
  path: './generated/types/user.ts',
  baseName: 'user.ts',
  sources: [/* ... */],
})

await fabric.addFile({
  path: './generated/api/user-api.ts',
  baseName: 'user-api.ts',
  sources: [/* ... */],
})

// Clean before generation
fabric.use(fsPlugin, {
  clean: { path: './generated' },
})
```

## Environment-Based Configuration

Adapt configuration based on environment:

```ts [env-config.ts]
const isDev = process.env.NODE_ENV === 'development'

fabric.use(loggerPlugin, {
  progress: isDev,
  websocket: isDev,
})

fabric.use(fsPlugin, {
  dryRun: process.env.DRY_RUN === 'true',
  clean: { path: './generated' },
})
```

## Reusable Configuration

Create reusable configuration functions:

```ts [reusable-config.ts]
function createDefaultFabric() {
  const fabric = createFabric()

  fabric.use(loggerPlugin, { progress: true })
  fabric.use(fsPlugin, { clean: { path: './generated' } })
  fabric.use(typescriptParser)

  return fabric
}

// Use in your generators
const fabric = createDefaultFabric()
await fabric.addFile(/* ... */)
await fabric.write()
```

## Best Practices

### Order Plugins Correctly

Register plugins in the correct order. The logger plugin should be registered first to capture all events:

```ts [plugin-order.ts]
// ✅ Correct order
fabric.use(loggerPlugin)
fabric.use(barrelPlugin)
fabric.use(fsPlugin)
fabric.use(typescriptParser)

// ❌ Incorrect - logger won't capture barrel plugin events
fabric.use(barrelPlugin)
fabric.use(loggerPlugin)
```

### Clean Before Generation

Always clean the output directory to avoid stale files:

```ts [clean-config.ts]
fabric.use(fsPlugin, {
  clean: { path: './generated' },
})
```

### Use Dry Run for Testing

Test generation without writing files:

```ts [dry-run-config.ts]
fabric.use(fsPlugin, {
  dryRun: true,
})

// Files are processed but not written to disk
await fabric.write()
```

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/getting-started/troubleshooting" class="vp-card">
      <h3>Troubleshooting</h3>
      <p>Common issues and solutions</p>
    </a>
    <a href="/core/create-fabric" class="vp-card">
      <h3>API Reference</h3>
      <p>Complete API documentation</p>
    </a>
    <a href="/guide/creating-plugins" class="vp-card">
      <h3>Creating Plugins</h3>
      <p>Build custom plugins</p>
    </a>
  </div>
</div>
