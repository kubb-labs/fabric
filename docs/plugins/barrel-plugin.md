---
layout: doc
title: barrel Plugin - Generate Index Files for Clean Imports
description: Use the barrelPlugin to auto-generate index.ts barrel files that re-export modules for cleaner imports in TypeScript.
outline: deep
---

# barrel Plugin - Generate Index Files

The barrelPlugin automatically generates `index.ts` barrel files per folder to re-export modules, simplifying import statements.

**Use barrelPlugin when:** You want clean, consolidated imports from generated code directories.

**Perfect for:** Multi-file generators, SDK generation, component libraries, clean import paths.

**Key features:**
- Auto-generate index.ts files
- Named or wildcard exports
- Nested directory support
- Tree-shaking friendly

## Usage

Register the barrel plugin to auto-generate index files.

**Example:** Generate named export barrel files.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})
```

## Plugin Options

### root

Root directory to generate barrel files for.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

**Example:**

```ts [root.ts]
fabric.use(barrelPlugin, {
  root: './src/generated',
  mode: 'named',
})
```

### mode

Controls how exports are generated in barrel files.

|           |                                       |
|----------:|:--------------------------------------|
|     Type: | `'all' \| 'named' \| 'propagate' \| false` |
| Required: | `true`                                |

**Modes:**

- `'all'` — Uses `export * from './module'` syntax
- `'named'` — Uses `export { Name } from './module'` syntax
- `'propagate'` — Skips barrel file generation
- `false` — Disables barrel generation

> [!TIP]
> Use `'named'` mode for better tree-shaking and explicit exports.

**Example:**

```ts [mode.ts]
// Named exports (recommended)
fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})

// All exports
fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'all',
})
```

### dryRun

If `true`, computes barrel files but skips writing them to disk.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

**Example:**

```ts [dry-run.ts]
fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
  dryRun: true, // Test without creating files
})
```

## Injected Methods

The `barrelPlugin` adds the `writeEntry()` method to the Fabric instance.

### `fabric.writeEntry()`

Generates a single entry barrel file at the specified root.

**Parameters:**

|      |                                     |                                     |
|-----:|:------------------------------------|:------------------------------------|
| root | `string`                            | Root directory for the entry barrel |
| mode | `'all' \| 'named' \| 'propagate' \| false` | Export style to use                 |

**Example:**

```ts [write-entry.ts]
await fabric.writeEntry({ root: './generated', mode: 'named' })
await fabric.write()
```

## Examples

### Basic Barrel Generation

```ts twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
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
```

This creates:

```ts [generated/models/index.ts]
export { User } from './user'
export { Post } from './post'
```

### Entry Barrel File

```ts twoslash [entry-barrel.ts]
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/types/user.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.addFile({
  baseName: 'api.ts',
  path: './generated/api/client.ts',
  sources: [
    { value: 'export const fetchUser = async () => {}', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()


```

This creates:

```ts [generated/index.ts]
export * from './types'
export * from './api'
```

### All Exports Mode

```ts twoslash [all-exports.ts]
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()


fabric.use(fsPlugin)
fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
})
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/types/user.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true, isIndexable: true, },
  ],
  imports: [],
  exports: []
})

await fabric.addFile({
  baseName: 'api.ts',
  path: './generated/api/client.ts',
  sources: [
    { value: 'export const fetchUser = async () => {}', isExportable: true, isIndexable: true, },
  ],
  imports: [],
  exports: []
})

// Generate entry barrel
await fabric.writeEntry({ root: './generated', mode: 'all' })
await fabric.write()

```

This creates:

```ts [generated/models/index.ts]
export * from "./api/client";
export * from "./types/user";
```

### Named Exports Mode

```ts twoslash [named-exports.ts]
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named', // Explicit named exports
})

fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'types.ts',
  path: './generated/models/types.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true },
    { value: 'export type Post = { id: number }', isExportable: true },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

This creates:

```ts [generated/models/index.ts]
export { User, Post } from './types'
```

### Dry Run

```ts twoslash [dry-run-barrel.ts]
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin, fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named',
  dryRun: true, // Compute barrels but don't write
})

fabric.use(fsPlugin)

await fabric.write()
// Barrel files computed but not written to disk
```

## Events

The `barrelPlugin` listens to the following events:

- `files:writing:start` — Generates barrel files per folder

## Best Practices

### Use Named Mode

Prefer `'named'` mode for better tree-shaking and explicit exports:

```ts
fabric.use(barrelPlugin, {
  root: './generated',
  mode: 'named', // Recommended
})
```

### Mark Exports as Exportable

Ensure sources are marked as exportable:

```ts
await fabric.addFile({
  path: './generated/file.ts',
  baseName: 'files.ts',
  sources: [
    { value: 'export const x = 1', isExportable: true }, // Must be true
  ],
  imports: [],
  exports: [],
})
```

### Generate Entry Barrel

Always call `writeEntry()` to create a root-level barrel:

> [!IMPORTANT]
> `writeEntry` should be called **before** `fabric.write()`.


```ts
await fabric.writeEntry({ root: './generated', mode: 'named' })
await fabric.write()
```

### Clean Before Generation

Clean the output directory to avoid stale barrel files:

```ts
fabric.use(fsPlugin, {
  clean: { path: './generated' },
})
```


## See Also

- [createFabric](/core/create-fabric) — Create a Fabric instance
- [fsPlugin](/plugins/fs-plugin) — Write files to disk
- [File Generation Patterns](/guide/file-generation-patterns) — Best practices
