---
layout: doc
title: Introduction
outline: deep
---

# Introduction

Kubb Fabric is a language-agnostic toolkit for generating code and files using JSX or TypeScript. It provides a lightweight, declarative layer for file generation while orchestrating the overall process of creating and managing files.

## What is Fabric?

Fabric is a file generation framework that combines the flexibility of JavaScript/TypeScript with the power of a plugin-based architecture.
You can generate any type of file—TypeScript types, API clients, configuration files, or documentation—using either imperative code or declarative JSX components.

## Fabric Core vs React Fabric

Fabric provides two packages with similar component names but different implementations.

### Fabric Core (@kubb/fabric-core)

Uses **FSX** (Fabric's custom JSX renderer) and `createComponent`.

**Characteristics:**
- Custom JSX runtime (not React)
- Uses `createComponent` from fabric-core
- Works with `FabricNode` types
- Lighter weight, no React dependency
- Direct control over rendering

**Example:**

```tsx [fabric-core.tsx]
import { createComponent } from '@kubb/fabric-core'

// Custom component using createComponent
export const MyComponent = createComponent('MyComponent', ({ children }) => {
  return children
})
```

See more in the [Core documentation](/core).

### React Fabric (@kubb/react-fabric)

Uses **React** with standard JSX and Fabric specific components.

See more in the [Fabric documentation](/react).

### When to Use Which?

Both packages export components with the same names.

**Use `fabric-core` when:**
- Building custom generators without `React`
- Want minimal dependencies
- No need to use JSX syntax

**Use `react-fabric` when:**
- Integrating with React applications
- Want familiar React and JSX patterns

### Import Paths

```ts
// Fabric Core
import { App, File, Function } from '@kubb/fabric-core'

// React Fabric
import { App, File, Function } from '@kubb/react-fabric'
```

## Why Fabric?

### Declarative File Generation

Create files using familiar JSX syntax or simple JavaScript objects. Fabric handles the complexity of file management, path resolution, and content generation.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { name: string }', isExportable: true },
  ],
  imports: [],
  exports: [],
})
```

### Plugin Architecture

Extend Fabric with plugins that add new capabilities. Plugins can listen to lifecycle events, transform files, or add new methods to the Fabric API.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(loggerPlugin, {
  progress: true,
  websocket: true,
})
```

### Parser System

Parsers control how files are converted to strings. Use built-in parsers for TypeScript, TSX, or create custom parsers for any file format.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()
fabric.use(typescriptParser)
```

## Key Features

- **Node.js 20+** - Modern JavaScript runtime support
- **Cross-Runtime Support1** - Fabric works seamlessly with Node.js and Bun, allowing you to choose the runtime that best fits your project.
- **Plugin system** - Extend with custom functionality or use community plugins
- **Event-Driven Architecture** - Listen to lifecycle events to monitor progress, transform files, or perform custom operations at specific points in the generation process.
- **Debug mode** - Use the `loggerPlugin` to visualize generation progress with beautiful CLI output, progress bars, and websocket support for building custom dashboards.
- **Barrel files** - Automatic `index.ts` generation for clean imports
- **React Integration** - The `@kubb/react-fabric` package enables using React components as templates for code generation, bringing the component model to file generation.


## When to Use Fabric

Fabric excels at:

- **Code generation** — Generate TypeScript types, API clients, or SDK code from schemas
- **Boilerplate creation** — Scaffold project files, components, or modules
- **File orchestration** — Manage multiple files with dependencies and barrel exports
- **Template-based generation** — Use React components or JSX for complex templating
