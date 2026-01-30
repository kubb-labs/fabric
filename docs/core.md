---
layout: doc
title: Fabric Core API - TypeScript Code Generator Engine
description: Fabric Core provides components, composables, and plugins for programmatic file generation with TypeScript. No React required.
outline: deep
---

# Fabric Core API Reference

`@kubb/fabric-core` provides the foundational runtime, components, and plugins for generating TypeScript files programmatically without React.

**What is Fabric Core:**
- Lightweight file generation framework with custom FSX renderer
- No React dependency required
- Plugin-based architecture for extensibility
- Event-driven lifecycle for custom hooks

**Use Fabric Core when:** Building code generators, CLI tools, or SDKs without React. Need minimal dependencies and direct rendering control.

## Key Features

- **Custom FSX renderer** - No React dependency, lightweight
- **Functional API** - Use `createComponent` for custom components
- **Plugin architecture** - Extend functionality with fs, logger, barrel plugins
- **TypeScript-first** - Full type safety and IntelliSense
- **Event-driven** - Hook into lifecycle events for custom logic
- **File management** - Deduplication, merging, and cache management

## Installation

Install `@kubb/fabric-core` as a dev dependency:

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

## Quick Start Example

Generate a TypeScript constant using Fabric Core's functional components.

::: code-group

```tsx twoslash [run.ts]
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

```ts [output]
export const API_URL: string = 'https://api.example.com'
```
:::

## Core API Concepts

### createFabric Factory

The `createFabric()` function creates a Fabric instance with methods for plugin registration, file management, and rendering.

```ts
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
```

**Learn more:** [createFabric API](/core/create-fabric)

### Core Components

Functional components for generating TypeScript code elements. Use these to build type definitions, constants, functions, and files.

- **[App](/core/components/app)** - Application container for file generation
- **[Root](/core/components/root)** - Root runtime context provider (no need to use directly)
- **[File](/core/components/file)** - File generation with imports/exports
- **[Function](/core/components/function)** - TypeScript function declarations
- **[Const](/core/components/const)** - TypeScript constant declarations
- **[Type](/core/components/type)** - TypeScript type declarations

### Composables (Hooks)

Access Fabric's internal context and state via composable hooks. Use these in custom components or plugins.

- **[useApp](/core/composables/use-app)** - Access application context
- **[useContext](/core/composables/use-context)** - Access Fabric context
- **[useFile](/core/composables/use-file)** - Access current file context
- **[useFileManager](/core/composables/use-file-manager)** - Manage files
- **[useLifecycle](/core/composables/use-lifecycle)** - Lifecycle event hooks
- **[useNodeTree](/core/composables/use-node-tree)** - Access component tree

### Event System

Listen to lifecycle events to track progress, transform files, or perform custom operations.

```ts
fabric.context.on('lifecycle:start', () => {
  console.log('Generation started')
})
```

**Learn more:** [Events API](/core/events)

## Import Paths

Fabric Core organizes exports into subpaths for tree-shaking and cleaner imports.

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

## Usage Examples

### Example 1: Basic File Generation

Generate a TypeScript file with type definitions using the imperative API.

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

### Example 2: Using FSX Components

Use Fabric's functional components to generate TypeScript types declaratively.

::: code-group

```tsx twoslash [run.ts]
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

```

```ts [output]
export type User = { id: number; name: string }
```
:::

## How Fabric Core Works

Fabric Core uses a custom runtime engine that:

1. **Transforms components** - Converts functional components into file structures
2. **Manages lifecycle** - Handles component lifecycle and rendering
3. **Provides context** - Makes state available through composables
4. **Emits events** - Triggers lifecycle events for plugin integration
5. **Handles files** - Deduplicates, merges, and caches files

## When to Use Fabric Core vs React Fabric

**✅ Use Fabric Core when:**
- Building custom code generators or CLI tools
- Working in non-React environments (Node.js, Bun)
- Minimal dependencies are critical
- You need direct control over the rendering process

**Consider React Fabric when:**
- You're already familiar with React patterns
- You want to use standard JSX syntax with React components
- You're building React-based tooling

**Learn more:** [React Fabric](/react)

## Next Steps

- [createFabric API](/core/create-fabric) - Factory function reference
- [File Component](/core/components/file) - Component documentation
- [Events Reference](/core/events) - Lifecycle events
- [Quick Start](/getting-started/quick-start) - Build your first generator

## FAQ

### What's the difference between Fabric Core and React Fabric?

Fabric Core uses a custom FSX renderer with `createComponent`, while React Fabric uses standard React. Core has no React dependency.

### Can I use JSX with Fabric Core?

Yes, but it's custom JSX (FSX), not React JSX. Use `createComponent` instead of `React.createElement`.

### Does Fabric Core work with Bun?

Yes, Fabric Core works with both Node.js 20+ and Bun 1.0+.

### How do I add custom components?

Use `createComponent` from `@kubb/fabric-core`:
```ts
import { createComponent } from '@kubb/fabric-core'

export const MyComponent = createComponent('MyComponent', ({ children }) => {
  return children
})
```

## Related Resources

- [createFabric](/core/create-fabric) - Factory function reference
- [Components](/core/components/file) - Component documentation
- [Events](/core/events) - Lifecycle events
- [React Fabric](/react) - React-based alternative
- [Plugins](/plugins/fsx-plugin) - Available plugins
- [Parsers](/parsers/typescript-parser) - Available parsers
