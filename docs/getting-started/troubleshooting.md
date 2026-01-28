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

```bash [npm]
npm install --save-dev @kubb/fabric-core
```

```bash [yarn]
yarn add -D @kubb/fabric-core
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
  imports: [],
  exports: [],
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
await fabric.writeEntry({ root: './generated', mode: 'named' })
```

3. Ensure files are exportable:

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

1. Check the [GitHub Issues](https://github.com/kubb-labs/fabric/issues)
2. Review the [Core Reference](/core)
3. Review the [React Reference](/react)
4. [Open a new issue](https://github.com/kubb-labs/fabric/issues/new)
