---
layout: doc
title: React Fabric
outline: deep
---

# React Fabric

`@kubb/react-fabric` provides React-based components and runtime for file generation using familiar JSX syntax and React patterns.

## Overview

React Fabric is a React integration for Fabric that enables component-based file generation using standard React and JSX. It leverages React's component model and reconciliation to generate code and files.

**Key Features:**
- Standard React and JSX
- Familiar React patterns (hooks, components)
- React DevTools support
- Interactive CLI rendering
- Built on top of Fabric Core
- TypeScript-first design

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
// export const API_URL: string = 'https://api.example.com'
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

### React Hooks

Standard React hooks are re-exported for convenience:

```tsx
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useReducer
} from '@kubb/react-fabric'
```

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

// React hooks (re-exported from React)
import { useState, useEffect, useContext } from '@kubb/react-fabric'

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

await fabric.render(<UserTypes />)
await fabric.waitUntilExit()
```

### With React State

```tsx twoslash
import { createReactFabric, File, Const, useState } from '@kubb/react-fabric'

const fabric = createReactFabric()

function DynamicGenerator() {
  const [count, setCount] = useState(0)

  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <File
          key={i}
          baseName={`config-${i}.ts`}
          path={`./generated/config-${i}.ts`}
        >
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

await fabric.render(<DynamicGenerator />)
await fabric.waitUntilExit()
```

### Multiple Files with Props

```tsx twoslash
import { createReactFabric, File, Type } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/react-fabric/plugins'

const fabric = createReactFabric()

fabric.use(fsPlugin, {
  clean: { path: './generated' }
})

interface EntityProps {
  name: string
  fields: Record<string, string>
}

function Entity({ name, fields }: EntityProps) {
  const fieldTypes = Object.entries(fields)
    .map(([key, type]) => `${key}: ${type}`)
    .join('; ')

  return (
    <File
      baseName={`${name.toLowerCase()}.ts`}
      path={`./generated/types/${name.toLowerCase()}.ts`}
    >
      <File.Source isExportable>
        <Type name={name} export>
          {`{ ${fieldTypes} }`}
        </Type>
      </File.Source>
    </File>
  )
}

function Generator() {
  const entities = [
    { name: 'User', fields: { id: 'number', name: 'string' } },
    { name: 'Post', fields: { id: 'number', title: 'string', userId: 'number' } },
    { name: 'Comment', fields: { id: 'number', text: 'string', postId: 'number' } }
  ]

  return (
    <>
      {entities.map(entity => (
        <Entity key={entity.name} {...entity} />
      ))}
    </>
  )
}

await fabric.render(<Generator />)
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

```tsx twoslash
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
// export function formatDate(): string {
//   return 'formatDate implementation'
// }
```

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
  mode: 'modern',           // React render mode
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

## See Also

- [createReactFabric](/react/createReactFabric) - Factory function reference
- [Components](/react/components/file) - React component documentation
- [Fabric Core](/core) - Underlying core package
- [reactPlugin](/plugins/react-plugin) - React plugin details
- [Plugins](/plugins/fs-plugin) - Available plugins
