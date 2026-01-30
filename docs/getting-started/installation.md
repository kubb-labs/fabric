---
layout: doc
title: Install Fabric - TypeScript Code Generator Setup
description: Install @kubb/fabric-core or @kubb/react-fabric with npm, pnpm, yarn, or bun. Node.js 20+ required.
outline: deep
---

# Installation Guide

Install Fabric in your project to start generating TypeScript code, API clients, or configuration files programmatically.

**Time to install:** < 1 minute  
**Requirements:** Node.js 20+ or Bun 1.0+

## Install Fabric Core

The core package provides Fabric's file generation engine with a lightweight custom JSX renderer (FSX). No React dependency required.

**Use Fabric Core when:**
- You want minimal dependencies
- You don't need React integration
- You prefer imperative TypeScript code

**Install command:**

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

## Install React Fabric (Optional)

The React integration package lets you use React components and standard JSX for code generation templates.

**Use React Fabric when:**
- You want familiar React/JSX patterns
- Your project already uses React
- You prefer component-based templates

**Install command:**

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

> [!NOTE]
> `@kubb/react-fabric` includes `@kubb/fabric-core` as a dependency. You don't need to install both separately.

## Verify Your Installation

Test that Fabric is installed correctly by creating a simple verification script.

**Create `test-fabric.ts`:**

```ts twoslash
import { createFabric } from '@kubb/fabric-core'

const fabric = createFabric()
console.log('Fabric initialized successfully!')
```

**Run the verification:**

::: code-group

```bash [bun]
bun test-fabric.ts
```

```bash [node]
node --loader tsx test-fabric.ts
```

:::

**Expected output:**
```
Fabric initialized successfully!
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Build your first code generator
- [Configuration](/getting-started/configure) - Set up plugins and parsers
- [Core API](/core) - Explore Fabric components

## Troubleshooting

### Module Not Found Error

If you see `Cannot find module '@kubb/fabric-core'`:

1. **Verify installation:**
   ```bash
   npm list @kubb/fabric-core
   ```

2. **Check package.json has ESM enabled:**
   ```json
   {
     "type": "module"
   }
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript Errors

If TypeScript shows module resolution errors, ensure your `tsconfig.json` uses ESM:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**More help:** See the [Troubleshooting Guide](/getting-started/troubleshooting)

## FAQ

### Which package should I install?

- Install `@kubb/fabric-core` for most use cases
- Install `@kubb/react-fabric` only if you want React/JSX template support

### Do I need React installed?

No, unless you use `@kubb/react-fabric`. The core package has no React dependency.

### What Node.js version is required?

Node.js 20 or higher is required for ESM support. Check your version:
```bash
node --version  # Should show v20.0.0 or higher
```

### Can I use Fabric with Bun?

Yes. Fabric works with Bun 1.0 or higher. Bun natively supports TypeScript and ESM.

## Related Resources

- [Introduction](/getting-started/introduction) - Learn about Fabric architecture
- [System Requirements](#system-requirements) - Check compatibility
- [TypeScript Configuration](#typescript-configuration) - Configure TypeScript properly
