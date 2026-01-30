---
layout: doc
contitle: Troubleshooting Fabric - Fix Common Code Generation Issues
description: Debug Fabric errors, file generation issues, parser problems, and plugin configuration. Solutions for empty files, module errors, and more.
outline: deep
---

# Troubleshooting Guide

Fix common Fabric issues including installation errors, file generation problems, parser configuration, and plugin issues.

**Quick links:**
- [Installation Issues](#installation-issues)
- [File Generation Issues](#file-generation-issues)
- [Parser Issues](#parser-issues)
- [Plugin Issues](#plugin-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### Module Not Found Error

**Problem:** `Cannot find module '@kubb/fabric-core'`

**Solution:** Ensure Fabric is installed and your project uses ESM (ECMAScript Modules).

::: code-group

```bash [bun]
bun add -d @kubb/fabric-core
```

```bash [pnpm]
pnpm add -D @kubb/fabric-core
```

```bash [npm]
npm install --save-dev @kubb/fabric-core
```

```bash [yarn]
yarn add -D @kubb/fabric-core
```

:::

**Verify package.json has ESM enabled:**

```json [package.json]
{
  "type": "module"
}
```

### TypeScript Module Resolution Errors

**Problem:** TypeScript cannot find types or shows module resolution errors

**Solution:** Configure TypeScript for ESM and proper module resolution.

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

### Files Not Written to Disk

**Problem:** Files are not created in the output directory

**Common causes:**
- `fsPlugin` not registered
- `dryRun` mode enabled
- Forgot to call `fabric.write()`

**Solutions:**

**1. Check that `fsPlugin` is registered:**

```ts [check-fs-plugin.ts]
import { fsPlugin } from '@kubb/fabric-core/plugins'

fabric.use(fsPlugin)
```

**2. Ensure `dryRun` is not enabled:**

```ts [disable-dry-run.ts]
fabric.use(fsPlugin, {
  dryRun: false, // Must be false to write files
})
```

**3. Verify you call `fabric.write()`:**

```ts [call-write.ts]
await fabric.addFile(/* ... */)
await fabric.write() // Don't forget this!
```

### Generated Files Are Empty

**Problem:** Files are created but contain no content

**Common causes:**
- No sources provided
- Parser not registered
- Parser doesn't match file extension

**Solutions:**

**1. Check that sources are provided:**

```ts [add-sources.ts]
await fabric.addFile({
  path: './output/file.ts',
  baseName: 'file.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true },
  ],
  imports: [],
  exports: [],
})
```

**2. Verify a parser is registered:**

```ts [register-parser.ts]
import { typescriptParser } from '@kubb/fabric-core/parsers'

fabric.use(typescriptParser)
```

### Incorrect File Extension Generated

**Problem:** Files are generated with wrong extensions (e.g., `.txt` instead of `.ts`)

**Solution:** Use extension mapping with `fabric.write()` to control output extensions.

```ts [extension-mapping.ts]
await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

## Parser Issues

### Wrong Parser Applied to Files

**Problem:** The wrong parser is being used for files (e.g., plain text parser for `.ts` files)

**Common causes:**
- Parser registered after `fabric.write()`
- Extension mapping doesn't match parser `extNames`

**Solutions:**

**1. Register the parser before calling `fabric.write()`:**

```ts [register-before-write.ts]
fabric.use(typescriptParser)
await fabric.write()
```

**2. Ensure extension mapping matches parser `extNames`:**

```ts [match-ext-names.ts]
// typescriptParser handles ['.ts']
fabric.use(typescriptParser)

await fabric.write({
  extension: { '.ts': '.ts' }, // Matches parser
})
```

### Imports or Exports Not Formatted Correctly

**Problem:** Import/export statements are malformed or missing

**Solution:** Use the correct parser for your file type.

```ts [use-correct-parser.ts]
// For .ts files
import { typescriptParser } from '@kubb/fabric-core/parsers'
fabric.use(typescriptParser)

// For .tsx files with JSX
import { tsxParser } from '@kubb/fabric-core/parsers'
fabric.use(tsxParser)
```

## Plugin Issues

### Event Listeners Not Triggered

**Problem:** Event listeners are not being called during generation

**Common causes:**
- Listeners registered after actions triggered
- Non-async event handlers blocking execution

**Solutions:**

**1. Register listeners before triggering actions:**

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

**2. Use `async` event handlers:**

```ts [async-handlers.ts]
fabric.context.on('lifecycle:start', async () => {
  await someAsyncOperation()
})
```

### Logger Progress Bar Not Displayed

**Problem:** Progress bar is not shown in the console

**Common causes:**
- `loggerPlugin` registered after other plugins
- `progress` option not enabled

**Solutions:**

**1. Ensure `loggerPlugin` is registered first:**

```ts [logger-first.ts]
fabric.use(loggerPlugin, { progress: true })
fabric.use(fsPlugin)
```

**2. Check that `progress` option is enabled:**

```ts [enable-progress.ts]
fabric.use(loggerPlugin, {
  progress: true, // Must be true
})
```

### Barrel Files (index.ts) Not Created

**Problem:** Index files are not generated automatically

**Common causes:**
- `barrelPlugin` not registered
- Forgot to call `writeEntry()`
- Sources not marked as exportable

**Solutions:**

**1. Register `barrelPlugin`:**

```ts [register-barrel.ts]
import { barrelPlugin } from '@kubb/fabric-core/plugins'

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})
```

**2. Call `writeEntry` for entry barrel:**

```ts [write-entry.ts]
await fabric.write()
await fabric.writeEntry({ root: './generated', mode: 'named' })
```

**3. Ensure files are exportable:**

```ts [exportable-sources.ts]
await fabric.addFile({
  path: './generated/file.ts',
  baseName: 'file.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true }, // Must be true
  ],
  imports: [],
  exports: [],
})
```

## Performance Issues

### Slow File Generation Performance

**Problem:** File generation takes too long for large projects

**Common causes:**
- WebSocket server overhead
- Processing too many files at once

**Solutions:**

**1. Disable websocket if not needed:**

```ts [disable-websocket.ts]
fabric.use(loggerPlugin, {
  progress: true,
  websocket: false,
})
```

**2. Process files in batches:**

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

### React Components Don't Produce Output

**Problem:** React components don't render or produce empty files

**Solution:** Ensure `reactPlugin` is registered when using `@kubb/react-fabric`.

```ts [register-react.ts]
import { reactPlugin } from '@kubb/react-fabric/plugins'

fabric.use(reactPlugin)
```

### JSX Syntax Errors in TypeScript

**Problem:** TypeScript shows errors with JSX syntax

**Solution:** Configure TypeScript for JSX with React JSX runtime.

```json [tsconfig.json]
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kubb/react-fabric"
  }
}
```

## Common Error Messages

### "Cannot read property 'files' of undefined"

**Problem**: Accessing `fabric.files` before adding files

**Solution**: Add files before accessing them:

```ts [access-after-add.ts]
const fabric = createFabric()

// ❌ Error - no files yet
console.log(fabric.files.length)

// ✅ Correct - add files first
await fabric.addFile({ /* ... */ })
console.log(fabric.files.length)
```

### "No parser found for extension .xxx"

**Problem**: No parser registered for the file extension

**Solution**: Register a parser or use the default parser:

```ts [register-parser-for-ext.ts]
import { defaultParser } from '@kubb/fabric-core/parsers'

fabric.use(defaultParser)

// Or create a custom parser
import { defineParser } from '@kubb/fabric-core/parsers'

const myParser = defineParser({
  name: 'my-parser',
  extNames: ['.xxx'],
  parse: ({ file }) => file.sources?.map(s => s.value).join('\n') || '',
})

fabric.use(myParser)
```

### "Path must include baseName"

**Problem**: File path doesn't end with baseName

**Solution**: Ensure path includes the file name:

```ts [path-with-basename.ts]
// ❌ Incorrect - path missing baseName
await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/types', // Missing file name
  sources: [],
  imports: [],
  exports: [],
})

// ✅ Correct - path includes baseName
await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/types/user.ts', // Includes file name
  sources: [],
  imports: [],
  exports: [],
})
```

## Environment-Specific Issues

### Node.js vs Bun Differences

**Problem**: Code works in Bun but not Node.js (or vice versa)

**Solutions**:

1. Use Node.js 20+ for proper ESM support:

```bash
node --version # Should be >= 20
```

2. Use `--loader` flag for TypeScript in Node.js:

```bash
node --loader tsx generate.ts
```

3. In Bun, TypeScript works natively:

```bash
bun generate.ts
```

### Windows Path Issues

**Problem**: File paths not working on Windows

**Solution**: Use forward slashes or `path.join()`:

```ts [windows-paths.ts]
import { join } from 'path'

// ✅ Good - Use forward slashes (cross-platform)
await fabric.addFile({
  path: './generated/types/user.ts',
  baseName: 'user.ts',
  sources: [],
  imports: [],
  exports: [],
})

// ✅ Good - Use path.join()
await fabric.addFile({
  path: join('generated', 'types', 'user.ts'),
  baseName: 'user.ts',
  sources: [],
  imports: [],
  exports: [],
})
```

## Debugging Tips

### Enable Verbose Logging

See what's happening during generation:

```ts [verbose-logging.ts]
fabric.context.on('lifecycle:start', () => console.log('Started'))
fabric.context.on('file:processing:update', ({ processed, total }) => {
  console.log(`Processing: ${processed}/${total}`)
})
fabric.context.on('files:writing:start', (files) => {
  console.log('Files to write:', files.map(f => f.path))
})
fabric.context.on('lifecycle:end', () => console.log('Complete'))
```

### Inspect Generated Files

Check files before writing:

```ts [inspect-files.ts]
fabric.context.on('files:writing:start', (files) => {
  for (const file of files) {
    console.log(`\nFile: ${file.path}`)
    console.log('Sources:', file.sources?.length || 0)
    console.log('Imports:', file.imports?.length || 0)

    // Print first source
    if (file.sources?.[0]) {
      console.log('Content preview:', file.sources[0].value.slice(0, 100))
    }
  }
})
```

### Use Dry Run for Testing

Test without writing files:

```ts [use-dry-run.ts]
fabric.use(fsPlugin, {
  dryRun: true, // Test mode
})

await fabric.write()

// Check what would be written
console.log('Would write:', fabric.files.length, 'files')
```

## Getting Help

If you encounter issues not covered here:

- **Check existing issues:** [GitHub Issues](https://github.com/kubb-labs/fabric/issues)
- **Read the docs:** [Core Reference](/core) | [React Reference](/react)
- **Report a bug:** [Open a new issue](https://github.com/kubb-labs/fabric/issues/new)

## FAQ

### Why are my files empty even though I added sources?

Check that you've registered a parser (`typescriptParser`, `tsxParser`, etc.) before calling `fabric.write()`. Without a parser, Fabric cannot convert file objects to strings.

### How do I know which parser is being used?

Listen to the `file:processing:update` event to debug which files are being processed:
```ts
fabric.context.on('file:processing:update', ({ processed, total }) => {
  console.log(`File ${processed}/${total}`)
})
```

### Can I test generation without writing files?

Yes, enable dry run mode:
```ts
fabric.use(fsPlugin, { dryRun: true })
await fabric.write()
console.log('Would generate:', fabric.files.length, 'files')
```

### Why doesn't the logger show a progress bar?

Ensure `loggerPlugin` is registered **first** and `progress: true` is set:
```ts
fabric.use(loggerPlugin, { progress: true })  // First!
fabric.use(fsPlugin)
```

### How do I fix "Path must include baseName" error?

Ensure the `path` property ends with the `baseName`:
```ts
// ✅ Correct
{ baseName: 'user.ts', path: './generated/user.ts' }

// ❌ Wrong
{ baseName: 'user.ts', path: './generated' }
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Build your first generator
- [Configuration](/getting-started/configure) - Configure plugins properly
- [Core API](/core) - Explore Fabric components

## Related Resources

- [Events Reference](/core/events) - All lifecycle events
- [Plugin Reference](/plugins) - All available plugins
- [Parser Reference](/parsers) - All available parsers
