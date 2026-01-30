---
layout: doc
title: Plugins
outline: deep
---

# Plugins

Fabric uses a plugin-based architecture to extend its code generation capabilities. Plugins provide file system operations, logging, dependency tracking, and React integration for JSX-based code generation.

## Core Plugins

### [fsPlugin](/plugins/fs-plugin)

Write files to disk and manage file system operations.

This is the foundational plugin that handles file I/O, providing the ability to write generated code to disk with options for dry runs and cleanup operations.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsPlugin, {
  dryRun: false,
  clean: { path: './generated' },
})
```

### [fsxPlugin](/plugins/fsx-plugin)

Process FSX (Fabric JSX) components and transform them into code.

Enables JSX-based code generation by processing FSX components and transforming them into the target output format.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(fsxPlugin)
```

## Utilities

### [loggerPlugin](/plugins/logger-plugin)

Add logging capabilities to your Fabric instance.

Provides structured logging for tracking file generation, processing steps, and debugging code generation workflows.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin, {
  logLevel: 'info',
})
```

### [barrelPlugin](/plugins/barrel-plugin)

Generate barrel files (index exports) for your code.

Automatically creates index files that re-export modules, simplifying imports and improving the developer experience.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { barrelPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(barrelPlugin, {
  output: './generated',
})
```

### [graphPlugin](/plugins/graph-plugin)

Track dependencies between generated files.

Creates a dependency graph of your generated files, enabling analysis and optimization of file relationships.

```typescript
import { createFabric } from '@kubb/fabric-core'
import { graphPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(graphPlugin)
```

## React Integration

### [reactPlugin](/plugins/react-plugin)

Enable React and JSX support for code generation.

Provides React reconciler integration, allowing you to use React components and hooks in your code generators.

```typescript
import { createReactFabric } from '@kubb/react-fabric'
import { reactPlugin } from '@kubb/react-fabric/plugins'

const fabric = createReactFabric()

fabric.use(reactPlugin)
```

## Example

Plugins are configured when creating your Fabric instance:

```typescript twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin, fsxPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()

fabric.use(loggerPlugin)
fabric.use(fsxPlugin)
fabric.use(fsPlugin, {
  dryRun: false,
  clean: { path: './generated' },
})
```
