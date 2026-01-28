---
layout: doc
title: graphPlugin
outline: deep
---

# `graphPlugin`

The `graphPlugin` visualizes the dependency graph of all files managed by Fabric. This plugin generates an interactive graph showing file relationships and optionally opens it in a browser.

## Installation

The graphPlugin is included in `@kubb/fabric-core`:

```ts [example.ts]
import { graphPlugin } from '@kubb/fabric-core/plugins'
```

## Usage

### Basic Example

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { graphPlugin, fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(graphPlugin, {
  root: './src',
  open: true,
})
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'user.ts',
  path: './src/user.ts',
  sources: [{ value: 'export interface User {}', isExportable: true }],
})

await fabric.write()
```

This generates a visual graph of all files under `./src` and opens it in your default browser.

## Options

| Option | Type      | Required | Default | Description                                        |
|--------|-----------|----------|---------|---------------------------------------------------|
| `root` | `string`  | Yes      | -       | Root directory where to start searching for files. |
| `open` | `boolean` | No       | `false` | Open the generated graph in a browser automatically. |

### `root`

The base directory from which the plugin searches for files to include in the graph.

```ts [example.ts]
fabric.use(graphPlugin, {
  root: './generated',
})
```

### `open`

When `true`, the plugin opens the generated graph visualization in your default web browser.

```ts [example.ts]
fabric.use(graphPlugin, {
  root: './src',
  open: true, // Opens browser automatically
})
```

## How It Works

The graphPlugin:

1. Listens to file events during Fabric execution
2. Analyzes file dependencies and relationships
3. Generates an interactive graph visualization
4. Optionally opens the graph in a browser

> [!TIP]
> Use the graphPlugin during development to understand file dependencies and optimize your code generation structure.

## Examples

### Debugging File Dependencies

Visualize which files depend on each other to identify circular dependencies or optimization opportunities.

```ts [example.ts]
fabric.use(graphPlugin, {
  root: './generated',
  open: true,
})
```

### Documentation

Generate visual documentation of your generated file structure for team reference.

```ts [example.ts]
fabric.use(graphPlugin, {
  root: './src/api',
  open: false, // Save graph without opening
})
```

## See Also

- [fsPlugin](/plugins/fs-plugin/) - Write files to disk
- [loggerPlugin](/plugins/logger-plugin/) - Monitor generation progress
- [Events](/core/events/) - Lifecycle events
