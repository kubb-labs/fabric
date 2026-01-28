---
layout: doc
title: Fabric Core
outline: deep
---

# Fabric Core

`@kubb/fabric-core` provides the foundational runtime and components for file generation using a custom runtime.

## Overview

Fabric Core is a lightweight, dependency-free file generation framework that uses a custom runtime. It provides the core functionality for creating, managing, and writing files using functional components.

**Key Features:**
- Custom FSX renderer (no React dependency)
- Functional API with `createComponent`
- Plugin-based architecture
- TypeScript-first design
- Event-driven lifecycle
- File management system

## Installation

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

## Quick Start

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Const } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Const({
  name: 'API_URL',
  export: true,
  type: 'string'
}).children(["'https://api.example.com'"])

const output = await fabric.render(component)
console.log(output)
```

This will log:
```
export const API_URL: string = 'https://api.example.com'
```

## Core Concepts

### createFabric

The main factory function for creating a Fabric instance. It provides methods for plugin registration, file management, and rendering.

```ts
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
```

**Learn more:** [createFabric](/core/create-fabric)

### Components

Fabric Core provides functional components for generating TypeScript code:

- **[App](/core/components/app)** - Application container for file generation
- **[Root](/core/components/root)** - Root runtime context provider (no need to use directly)
- **[File](/core/components/file)** - File generation with imports/exports
- **[Function](/core/components/function)** - TypeScript function declarations
- **[Const](/core/components/const)** - TypeScript constant declarations
- **[Type](/core/components/type)** - TypeScript type declarations

### Composables

Hooks for accessing Fabric's internal context and state:

- **[useApp](/core/composables/use-app)** - Access application context
- **[useContext](/core/composables/use-context)** - Access Fabric context
- **[useFile](/core/composables/use-file)** - Access current file context
- **[useFileManager](/core/composables/use-file-manager)** - Manage files
- **[useLifecycle](/core/composables/use-lifecycle)** - Lifecycle event hooks
- **[useNodeTree](/core/composables/use-node-tree)** - Access component tree

### Events

Fabric Core provides a comprehensive event system for lifecycle management:

```ts
fabric.context.on('lifecycle:start', () => {
  console.log('Generation started')
})
```

**Learn more:** [Events](/core/events)

## Import Paths

```ts
// Core components and utilities
import { createFabric, File, Const, Type, Function } from '@kubb/fabric-core'

// Plugins
import { fsxPlugin, fsPlugin, loggerPlugin } from '@kubb/fabric-core/plugins'

// Parsers
import { typescriptParser, defaultParser } from '@kubb/fabric-core/parsers'

// Types
import type { Fabric, FabricNode, FabricContext } from '@kubb/fabric-core/types'
```

## Examples

### Basic File Generation

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  clean: { path: './generated' }
})
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './generated/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true }
  ],
  imports: [],
  exports: []
})

await fabric.write()
```

### Using FSX Components

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { File, Type } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'types.ts',
  path: './generated/types.ts'
}).children([
  File.Source({ isExportable: true }).children([
    Type({ name: 'User', export: true }).children([
      '{ id: number; name: string }'
    ])
  ])
])

const output = await fabric.render(component)
console.log(output)

```

This will log:
```
export type User = { id: number; name: string }
```

## Architecture

Fabric Core uses a custom runtime that:
- Transforms functional components into file structures
- Manages component lifecycle and rendering
- Provides context through composables
- Emits events for plugin integration
- Handles file deduplication and merging

## When to Use

**Use Fabric Core when:**
- Building custom code generators
- Working in non-React environments
- Minimal dependencies are important
- Direct control over rendering is needed

**Consider React Fabric when:**
- Familiar with React patterns
- Want JSX syntax with React components

## See Also

- [createFabric](/core/create-fabric) - Factory function reference
- [Components](/core/components/file) - Component documentation
- [Events](/core/events) - Lifecycle events
- [React Fabric](/react) - React-based alternative
- [Plugins](/plugins/fsx-plugin) - Available plugins
- [Parsers](/parsers/typescript-parser) - Available parsers
