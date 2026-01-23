---
layout: doc
title: Introduction
outline: deep
---

# Introduction

Kubb Fabric is a language-agnostic toolkit for generating code and files using JSX and TypeScript. It provides a lightweight, declarative layer for file generation while orchestrating the overall process of creating and managing files.

## What is Fabric?

Fabric is a file generation framework that combines the flexibility of JavaScript/TypeScript with the power of a plugin-based architecture. You can generate any type of file—TypeScript types, API clients, configuration files, or documentation—using either imperative code or declarative JSX components.

## Why Fabric?

### Declarative File Generation

Create files using familiar JSX syntax or simple JavaScript objects. Fabric handles the complexity of file management, path resolution, and content generation.

```ts [declarative-example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { name: string }', isExportable: true },
  ],
})
```

### Plugin Architecture

Extend Fabric with plugins that add new capabilities. Plugins can listen to lifecycle events, transform files, or add new methods to the Fabric API.

```ts [plugin-example.ts]
import { loggerPlugin } from '@kubb/fabric-core/plugins'

fabric.use(loggerPlugin, {
  progress: true,
  websocket: true,
})
```

### Parser System

Parsers control how files are converted to strings. Use built-in parsers for TypeScript, TSX, or create custom parsers for any file format.

```ts [parser-example.ts]
import { typescriptParser } from '@kubb/fabric-core/parsers'

fabric.use(typescriptParser)
```

## Key Features

### Cross-Runtime Support

Fabric works seamlessly with Node.js and Bun, allowing you to choose the runtime that best fits your project.

### Event-Driven Architecture

Listen to lifecycle events to monitor progress, transform files, or perform custom operations at specific points in the generation process.

### Built-in Debugging

Use the `loggerPlugin` to visualize generation progress with beautiful CLI output, progress bars, and websocket support for building custom dashboards.

### React Integration

The `@kubb/react-fabric` package enables using React components as templates for code generation, bringing the component model to file generation.

## When to Use Fabric

Fabric excels at:

- **Code generation** — Generate TypeScript types, API clients, or SDK code from schemas
- **Boilerplate creation** — Scaffold project files, components, or modules
- **File orchestration** — Manage multiple files with dependencies and barrel exports
- **Template-based generation** — Use React components or JSX for complex templating

## Core Concepts

### Fabric Instance

The `createFabric()` function returns a Fabric instance with methods for registering plugins, adding files, and triggering generation.

### FileManager

Manages the in-memory cache of files to be generated. You can add files individually or in batches.

### Plugins

Extend Fabric with reusable functionality. Plugins can write files to disk, generate barrel exports, log progress, or add custom behavior.

### Parsers

Transform file objects into strings. Parsers handle imports, exports, and source code formatting based on file extensions.

### Events

Fabric emits events throughout its lifecycle. Plugins and custom code can listen to these events to react to specific stages of file generation.

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/getting-started/installation" class="vp-card">
      <h3>Installation</h3>
      <p>Install Fabric in your project</p>
    </a>
    <a href="/getting-started/quick-start" class="vp-card">
      <h3>Quick Start</h3>
      <p>Build your first code generator in minutes</p>
    </a>
    <a href="/getting-started/configuration" class="vp-card">
      <h3>Configuration</h3>
      <p>Learn how to configure Fabric</p>
    </a>
  </div>
</div>
