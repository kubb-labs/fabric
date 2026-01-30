---
layout: doc
title: React Fabric - JSX Code Generator with React Components
description: Build type-safe code generators using React JSX. React Fabric adds familiar React patterns to Fabric's code generation toolkit.
outline: deep
---

# React Fabric

Build code generators using React components and JSX. React Fabric combines React's declarative component model with Fabric's code generation capabilities for intuitive, type-safe file generation.

## What is React Fabric?

React Fabric brings React's component-based development to code generation. Write JSX to generate TypeScript files, using familiar React patterns like hooks, components, and props. It's built on top of Fabric Core and adds React-specific rendering capabilities.

## Why Use React Fabric?

**If you already know React**, React Fabric is the fastest way to build code generators:

- **Familiar syntax** - Use JSX and React patterns you already know
- **Type-safe** - Full TypeScript IntelliSense for all components
- **Composable** - Build complex generators from small components
- **Debuggable** - React DevTools support for debugging generators

**When to choose React Fabric over Fabric Core:**
- You prefer React's component model
- You want to reuse React skills for code generation
- You need complex conditional rendering
- You want DevTools support

## Installation

::: code-group

```bash [bun]
bun add -d @kubb/react-fabric
```

```bash [pnpm]
pnpm add -D @kubb/react-fabric
```

```bash [npm]
npm install --save-dev @kubb/react-fabric
```

```bash [yarn]
yarn add -D @kubb/react-fabric
```

:::

## Quick Start

```tsx twoslash
import { createReactFabric, Const } from '@kubb/react-fabric'

const fabric = createReactFabric()

function Generator() {
  return (
    <Const name="API_URL" export type="string">
      'https://api.example.com'
    </Const>
  )
}

const output = await fabric.renderToString(<Generator />)
console.log(output)
```

This will log:
```
export const API_URL: string = 'https://api.example.com'
```

## Core Concepts

### createReactFabric

Factory function that creates a Fabric instance pre-configured with React support. It automatically registers the `reactPlugin` and provides React-specific rendering methods.

```tsx
import { createReactFabric } from '@kubb/react-fabric'

const fabric = createReactFabric({
  devtools: true,  // Open React DevTools
  debug: false     // Enable debug logging
})
```

**Learn more:** [createReactFabric](/react/createReactFabric)

### Components

React Fabric provides JSX components for generating TypeScript code:

- **[App](/react/components/app)** - Application container component
- **[File](/react/components/file)** - File generation with imports/exports
- **[Function](/react/components/function)** - TypeScript function declarations
- **[Const](/react/components/const)** - TypeScript constant declarations
- **[Type](/react/components/type)** - TypeScript type declarations
- **[Root](/react/components/root)** - Root runtime provider

### Rendering Methods

React Fabric provides three rendering methods:

```tsx
// Render with side effects (file writing)
await fabric.render(<App />)

// Render to string (no side effects)
const output = await fabric.renderToString(<Component />)

// Wait for render completion
await fabric.waitUntilExit()
```

## Import Paths

```tsx
// Factory and components
import { createReactFabric, File, Const, Type, Function } from '@kubb/react-fabric'

// Plugins and parsers (inherited from fabric-core)
import { fsPlugin, loggerPlugin } from '@kubb/react-fabric/plugins'
import { typescriptParser } from '@kubb/react-fabric/parsers'

// Types
import type { Fabric, KubbNode, KubbElement } from '@kubb/react-fabric/types'
```

## Examples

### Basic Component

```tsx twoslash
import { createReactFabric, File, Type } from '@kubb/react-fabric'

const fabric = createReactFabric()

function UserTypes() {
  return (
    <File baseName="user.ts" path="./generated/user.ts">
      <File.Source isExportable>
        <Type name="User" export>
          {'{ id: number; name: string; email: string }'}
        </Type>
      </File.Source>
    </File>
  )
}

const output = await fabric.renderToString(<UserTypes />)

```

### With React State

```tsx twoslash
import { createReactFabric, File, Const, useState, useEffect, useLifecycle } from '@kubb/react-fabric'

function DynamicGenerator() {
  const { exit } = useLifecycle()
  const [count, setCount] = useState(0)

  if (count === 3) {
    exit()
  }

  useEffect(() => {
    setCount(3) // Simulate dynamic change
  }, [])

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <File key={i} baseName={`config-${i}.ts`} path={`./gen/config-${i}.ts`}>
          <File.Source isExportable>
            <Const name={`CONFIG_${i}`} export>
              {`'value-${i}'`}
            </Const>
          </File.Source>
        </File>
      ))}
    </>
  )
}

const fabric = createReactFabric()

await fabric.render(<DynamicGenerator />)

await fabric.waitUntilExit()
```

### With DevTools

Enable React DevTools for debugging component tree:

```tsx twoslash
import { createReactFabric, Const } from '@kubb/react-fabric'

const fabric = createReactFabric({
  devtools: true,
  debug: true
})

function App() {
  return (
    <Const name={'hello'}>"World!"</Const>
  )
}

await fabric.render(<App />)
await fabric.waitUntilExit()
```

### Template Rendering

Use `renderToString` for template generation:


::: code-group

```tsx twoslash [run.ts]
import { createReactFabric, Function } from '@kubb/react-fabric'

const fabric = createReactFabric()

interface HelperProps {
  name: string
  returnType: string
}

function Helper({ name, returnType }: HelperProps) {
  return (
    <Function name={name} export returnType={returnType}>
      {`return '${name} implementation'`}
    </Function>
  )
}

const code = await fabric.renderToString(
  <Helper name="formatDate" returnType="string" />
)

console.log(code)
```

```ts [output]
export function formatDate(): string {
  return 'formatDate implementation'
}
```
:::

## Configuration

### TSConfig Setup

For JSX support, configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kubb/react-fabric"
  }
}
```

### Runtime Options

```tsx
const fabric = createReactFabric({
  mode: 'sequential',       // Available modes for file processing, 'sequential' or 'parallel. 'sequential' by default.
  devtools: false,          // Open React DevTools
  debug: false,             // Debug logging
  stdout: process.stdout,   // Output stream
  stderr: process.stderr    // Error stream
})
```

## Architecture

React Fabric uses:
- **React Reconciler** - Custom reconciler for component tree
- **Fabric Core** - Underlying file management and rendering
- **React DevTools** - Optional debugging support
- **Event System** - Lifecycle and file events

The React reconciler transforms JSX components into Fabric's internal file structure, which is then processed by plugins and written to disk.

## When to Use

**Use React Fabric when:**
- Familiar with React patterns
- Building complex, stateful generators
- Want component composition
- Need React DevTools debugging
- Prefer JSX syntax

**Consider Fabric Core when:**
- No React dependency desired
- Building simple generators
- Functional API is preferred
- Minimal bundle size is critical

## FAQ

### What's the difference between React Fabric and Fabric Core?

React Fabric uses React components and JSX syntax. Fabric Core uses FSX (a lighter JSX-like syntax without React). Choose React if you know React; choose Core for minimal dependencies.

### Can I use React hooks in my generators?

Yes. React Fabric supports `useState`, `useEffect`, and custom hooks. It also provides Fabric-specific hooks like `useFile()`, `useApp()`, and `useLifecycle()`.

### Does this require React DOM?

No. React Fabric uses a custom React reconciler - no browser or DOM required. It runs entirely in Node.js.

### Can I debug with React DevTools?

Yes. Set `devtools: true` when creating the Fabric instance to connect React DevTools for component tree inspection.

### How do I generate multiple files?

Use multiple `<File>` components in your generator. Each File component creates a separate output file.

## See also

- [createReactFabric()](/react/createReactFabric) - Factory function API reference
- [React Components](/react/components/file) - Full component API docs
- [Fabric Core](/core) - Learn about the underlying core package
- [React Plugin](/plugins/react-plugin) - React plugin implementation details

## Next Steps

- [Quick Start Guide](/getting-started/quick-start) - Build your first generator
- [Component Reference](/react/components/file) - Explore available components
- [Creating Plugins](/guide/creating-plugins) - Extend React Fabric with plugins
