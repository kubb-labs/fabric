---
layout: doc
title: Installation
outline: deep
---

# Installation

Install Fabric in your project using your preferred package manager.

## Package Managers

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

## React Integration

If you want to use React components for code generation, install the React integration package:

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

> [!NOTE]
> The `@kubb/react-fabric` package includes `@kubb/fabric-core` as a dependency, so you do not need to install both packages separately.

## System Requirements

Fabric requires Node.js 20 or higher, or Bun 1.0 or higher.

|           |          |
|----------:|:---------|
|  Node.js: | `>= 20`  |
|      Bun: | `>= 1.0` |

## TypeScript Configuration

Fabric is written in TypeScript and provides full type definitions. You should configure your TypeScript project with `module: "ESNext"` or `module: "NodeNext"` since Kubb prefers ESM.

```json [tsconfig.json]
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2023"]
  }
}
```

## Verify Installation

Create a simple test file to verify Fabric is installed correctly:

```ts [test-fabric.ts]
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
console.log('Fabric initialized successfully!')
```

Run the file:

::: code-group

```bash [bun]
bun test-fabric.ts
```

```bash [node]
node --loader tsx test-fabric.ts
```

:::

You should see "Fabric initialized successfully!" in the console.

## Next Steps

<div class="vp-doc">
  <div class="vp-card-container">
    <a href="/getting-started/quick-start" class="vp-card">
      <h3>Quick Start</h3>
      <p>Build your first code generator</p>
    </a>
    <a href="/getting-started/configure" class="vp-card">
      <h3>configure</h3>
      <p>Learn how to configure Fabric</p>
    </a>
    <a href="/core/create-fabric" class="vp-card">
      <h3>API Reference</h3>
      <p>Explore the Fabric API</p>
    </a>
  </div>
</div>
