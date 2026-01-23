---
layout: doc
title: Troubleshooting
outline: deep
---

# Troubleshooting

Common issues and solutions when working with Fabric.

## Installation Issues

### Module Not Found

**Problem**: `Cannot find module '@kubb/fabric-core'`

**Solution**: Ensure Fabric is installed and your project uses ESM:

::: code-group

```bash [bun]
bun add -d @kubb/fabric-core
```

```bash [pnpm]
pnpm add -D @kubb/fabric-core
```

:::

Check your `package.json`:

```json [package.json]
{
  "type": "module"
}
```

### TypeScript Errors

**Problem**: TypeScript cannot find types or shows module resolution errors

**Solution**: Configure TypeScript for ESM:

```json [tsconfig.json]
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

## File Generation Issues

### Files Not Being Written

**Problem**: Files are not created in the output directory

**Solutions**:

1. Check that `fsPlugin` is registered:

```ts [check-fs-plugin.ts]
import { fsPlugin } from '@kubb/fabric-core/plugins'

fabric.use(fsPlugin)
```

2. Ensure `dryRun` is not enabled:

```ts [disable-dry-run.ts]
fabric.use(fsPlugin, {
  dryRun: false, // Must be false to write files
})
```

3. Verify you call `fabric.write()`:

```ts [call-write.ts]
await fabric.addFile(/* ... */)
await fabric.write() // Don't forget this!
```

### Empty Files Generated

**Problem**: Files are created but contain no content

**Solutions**:

1. Check that sources are provided:

```ts [add-sources.ts]
await fabric.addFile({
  path: './output/file.ts',
  baseName: 'file.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true },
  ],
})
```

2. Verify a parser is registered:

```ts [register-parser.ts]
import { typescriptParser } from '@kubb/fabric-core/parsers'

fabric.use(typescriptParser)
```

### Wrong File Extension

**Problem**: Files are generated with incorrect extensions

**Solution**: Use extension mapping with `fabric.write()`:

```ts [extension-mapping.ts]
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

## Parser Issues

### Parser Not Applied

**Problem**: The wrong parser is being used for files

**Solutions**:

1. Register the parser before calling `fabric.write()`:

```ts [register-before-write.ts]
fabric.use(typescriptParser)
await fabric.write()
```

2. Ensure extension mapping matches parser `extNames`:

```ts [match-ext-names.ts]
// typescriptParser handles ['.ts']
fabric.use(typescriptParser)

await fabric.write({
  extension: { '.ts': '.ts' }, // Matches parser
})
```

### Import/Export Issues

**Problem**: Imports or exports are not formatted correctly

**Solution**: Use the correct parser for your file type:

```ts [use-correct-parser.ts]
// For .ts files
import { typescriptParser } from '@kubb/fabric-core/parsers'
fabric.use(typescriptParser)

// For .tsx files with JSX
import { tsxParser } from '@kubb/fabric-core/parsers'
fabric.use(tsxParser)
```

## Plugin Issues

### Events Not Firing

**Problem**: Event listeners are not being called

**Solutions**:

1. Register listeners before triggering actions:

```ts [register-early.ts]
const fabric = createFabric()

// Register listeners first
fabric.context.on('lifecycle:start', () => {
  console.log('Started!')
})

// Then perform actions
fabric.use(fsPlugin)
await fabric.write()
```

2. Use `async` event handlers:

```ts [async-handlers.ts]
fabric.context.on('lifecycle:start', async () => {
  await someAsyncOperation()
})
```

### Logger Not Showing Progress

**Problem**: Progress bar is not displayed

**Solutions**:

1. Ensure `loggerPlugin` is registered first:

```ts [logger-first.ts]
fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin)
```

2. Check that `progress` option is enabled:

```ts [enable-progress.ts]
fabric.use(loggerPlugin, {
  progress: true, // Must be true
})
```

### Barrel Files Not Generated

**Problem**: Index files are not created

**Solutions**:

1. Register `barrelPlugin`:

```ts [register-barrel.ts]
import { barrelPlugin } from '@kubb/fabric-core/plugins'

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})
```

2. Call `writeEntry` for entry barrel:

```ts [write-entry.ts]
await fabric.write()
await fabric.writeEntry('./generated', 'named')
```

3. Ensure files are exportable:

```ts [exportable-sources.ts]
await fabric.addFile({
  path: './generated/file.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true }, // Must be true
  ],
})
```

## Performance Issues

### Slow Generation

**Problem**: File generation takes too long

**Solutions**:

1. Disable websocket if not needed:

```ts [disable-websocket.ts]
fabric.use(loggerPlugin, {
  progress: true,
  websocket: false,
})
```

2. Process files in batches:

```ts [batch-processing.ts]
const files = [...] // Large array of files

// Add files in batches
for (let i = 0; i < files.length; i += 100) {
  const batch = files.slice(i, i + 100)
  await Promise.all(batch.map(f => fabric.addFile(f)))
}

await fabric.write()
```

## React Integration Issues

### React Components Not Rendering

**Problem**: React components don't produce output

**Solution**: Ensure `reactPlugin` is registered:

```ts [register-react.ts]
import { reactPlugin } from '@kubb/react-fabric/plugins'

fabric.use(reactPlugin)
```

### JSX Not Working

**Problem**: TypeScript errors with JSX syntax

**Solution**: Configure TypeScript for JSX:

```json [tsconfig.json]
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kubb/react-fabric"
  }
}
```

## Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/kubb-labs/fabric/issues)
2. Review the [API Reference](/api/core/create-fabric)
3. Look at [Examples](/examples/)
4. [Open a new issue](https://github.com/kubb-labs/fabric/issues/new)

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/guide/" class="vp-card">
      <h3>Guides</h3>
      <p>In-depth guides for common tasks</p>
    </a>
    <a href="/api/core/create-fabric" class="vp-card">
      <h3>API Reference</h3>
      <p>Complete API documentation</p>
    </a>
    <a href="https://github.com/kubb-labs/fabric/issues" class="vp-card">
      <h3>Report Issue</h3>
      <p>Found a bug? Let us know</p>
    </a>
  </div>
</div>
