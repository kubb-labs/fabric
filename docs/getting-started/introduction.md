---
layout: doc
title: Fabric - JSX Code Generator for TypeScript & Files
description: Generate TypeScript types, API clients, and files using JSX. Language-agnostic code generation toolkit with plugin architecture.
outline: deep
---

# Fabric - JSX Code Generator for TypeScript & Files

Fabric is a language-agnostic toolkit for generating code and files using JSX or TypeScript. Build type-safe code generators for API clients, TypeScript types, configuration files, or documentation with a declarative, plugin-based architecture.

**Use Fabric when you need to:**
- Generate TypeScript types or API clients from schemas
- Scaffold boilerplate code for projects or components
- Orchestrate multi-file generation with dependencies
- Use React/JSX templates for complex code generation

**Perfect for:** Developers building code generators, CLI tools, SDK generators, or automation scripts.

## What is Fabric?

Fabric combines JavaScript/TypeScript flexibility with a plugin-based architecture for programmatic file generation.

Generate any file type:
- TypeScript types and interfaces
- API clients and SDKs
- Configuration files (JSON, YAML, ENV)
- Documentation (Markdown, MDX)

**Two approaches:** Use imperative TypeScript code or declarative JSX components.

## Fabric Core vs React Fabric

Fabric provides two packages with similar component names but different implementations.

### Fabric Core (@kubb/fabric-core)

Uses **FSX** (Fabric's custom JSX renderer) and `createComponent`.

**Characteristics:**
- Uses `createComponent` to define FSX components
- Lighter weight, no React dependency
- Direct control over rendering

**Example:**

```tsx
import { createComponent } from '@kubb/fabric-core'

// Custom component using createComponent
export const MyComponent = createComponent('MyComponent', ({ children }) => {
  return children
})
```

**Learn more:** [Core documentation](/guide/creating-plugins) | [Create custom components](/core/create-fabric)

### React Fabric (@kubb/react-fabric)

Uses **React** with standard JSX and Fabric specific components.

**Learn more:** [React Fabric documentation](/react) | [React components](/react/createReactFabric)

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
import { Fabric, File, Function } from '@kubb/fabric-core'

// React Fabric
import { Fabric, File, Function } from '@kubb/react-fabric'
```

## Why Use Fabric?

### Declarative File Generation

Write code generators using familiar JSX syntax or JavaScript objects. Fabric handles file management, path resolution, and content generation automatically.

**Example:** Generate a TypeScript types file programmatically.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { name: string }', isExportable: true },
  ],
  imports: [],
  exports: [],
})
```

### Plugin Architecture

Extend Fabric with plugins for custom functionality:
- Listen to lifecycle events (file:processing, lifecycle:start)
- Transform files during generation
- Add new methods to the Fabric API

**Example:** Enable progress tracking with the logger plugin.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { loggerPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(loggerPlugin, {
  progress: true
})
```

**Learn more:** [Creating plugins](/guide/creating-plugins) | [Available plugins](/plugins)

### Parser System

Parsers convert file objects to strings during generation. Control output format for any file type.

**Built-in parsers:**
- TypeScript (`.ts` files)
- TSX (`.tsx` files with JSX)
- Default (plain text)

**Example:** Register the TypeScript parser for `.ts` file generation.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()
fabric.use(typescriptParser)
```

**Learn more:** [Creating parsers](/guide/creating-parsers) | [Parser API](/parsers)

## Key Features

- **Node.js 20+** - Modern JavaScript runtime support
- **Cross-Runtime Support1** - Fabric works seamlessly with `Node.js` and `Bun`, allowing you to choose the runtime that best fits your project.
- **Plugin system** - Extend with custom functionality or use community plugins
- **Event-Driven Architecture** - Listen to lifecycle events to monitor progress, transform files, or perform custom operations at specific points in the generation process.
- **Debug mode** - Use the `loggerPlugin` to visualize generation progress with beautiful CLI output, progress bars.
- **Barrel files** - Automatic `index.ts` generation for clean imports
- **React Integration** - The `@kubb/react-fabric` package enables using React components as templates for code generation, bringing the component model to file generation.


## When to Use Fabric

Fabric excels at these code generation scenarios:

- **Code generation** — Generate TypeScript types, API clients, or SDK code from OpenAPI/GraphQL schemas
- **Boilerplate creation** — Scaffold project files, React components, or module structures
- **File orchestration** — Manage multiple files with dependencies and barrel exports (index.ts)
- **Template-based generation** — Use React components or JSX for complex code templating

## Common Use Cases

- Building CLI code generators
- Generating TypeScript types from JSON schemas
- Creating API client libraries from OpenAPI specs
- Automating React component scaffolding
- Building custom bundler plugins

## Next Steps

- [Installation](/getting-started/installation) - Install Fabric in your project
- [Quick Start](/getting-started/quick-start) - Build your first code generator
- [Configuration](/getting-started/configure) - Configure plugins and parsers
- [Core API](/core) - Explore Fabric core components

## FAQ

### What's the difference between Fabric Core and React Fabric?

Fabric Core uses a custom FSX renderer with `createComponent`, while React Fabric uses standard React JSX. Use Core for minimal dependencies, React for familiar React patterns.

### Can Fabric generate non-TypeScript files?

Yes. Fabric is language-agnostic. Create custom parsers for any file format (JSON, YAML, Python, Go, etc.).

### Does Fabric require React?

No. Only `@kubb/react-fabric` requires React. The core package (`@kubb/fabric-core`) has no React dependency.

### How does Fabric compare to Plop or Hygen?

Fabric provides programmatic control via TypeScript/JSX rather than template files. Better for complex logic, type safety, and IDE autocomplete.
