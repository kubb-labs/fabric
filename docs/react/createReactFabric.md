---
layout: doc
title: createReactFabric - React Fabric Factory Function
description: Create React Fabric instances for JSX-based code generation. Factory function for component-based TypeScript generators.
outline: deep
---

# `createReactFabric`

Create a Fabric instance pre-configured with React support for component-based code generation. This factory function automatically sets up the React runtime and plugin system.

> [!NOTE]
> This is a convenience wrapper around `createFabric()` that automatically configures the `reactPlugin`.
> For the core version, see [createFabric](/core/create-fabric).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, File, Const } from '@kubb/react-fabric'

const fabric = createReactFabric()

function Generator() {
  return (
    <File baseName="config.ts" path="./generated/config.ts">
      <File.Source isExportable>
        <Const name="API_URL" export type="string">
          'https://api.example.com'
        </Const>
      </File.Source>
    </File>
  )
}

const output = await fabric.renderToString(<Generator />)
```

```ts [output]
export const API_URL: string = 'https://api.example.com'
```
:::

## What is createReactFabric?

`createReactFabric()` is a convenience wrapper around `createFabric()` that automatically configures the React plugin. It returns a Fabric instance ready for React-based code generation with JSX components.

## Why Use createReactFabric?

- **Automatic setup** - React plugin pre-configured and registered
- **Type-safe** - Full TypeScript support for all methods
- **React methods** - Adds `render()` and `renderToString()` to Fabric instance
- **DevTools ready** - Optional React DevTools integration

## How to Use

1. Call `createReactFabric()` to create an instance
2. Write generator components using JSX
3. Render with `render()` (side effects) or `renderToString()` (pure)

## Options

Optional configuration for the React Fabric instance.

|           |                  |
|----------:|:-----------------|
|     Type: | `FabricConfig`   |
| Required: | `false`          |

### mode

Controls render mode for React components.

|           |                           |
|----------:|:--------------------------|
|     Type: | `'legacy' \| 'modern'`    |
| Required: | `false`                   |
|  Default: | `'modern'`                |

### devtools

Open React DevTools when rendering.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### stdout

Output stream for rendered content.

|           |                      |
|----------:|:---------------------|
|     Type: | `NodeJS.WriteStream` |
| Required: | `false`              |

### stdin

Input stream for interactive components.

|           |                     |
|----------:|:--------------------|
|     Type: | `NodeJS.ReadStream` |
| Required: | `false`             |

### stderr

Error output stream.

|           |                      |
|----------:|:---------------------|
|     Type: | `NodeJS.WriteStream` |
| Required: | `false`              |

### debug

Enable debug logging for render lifecycle.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

## Injected Methods

The `reactPlugin` injects additional methods into the Fabric instance:

### `fabric.render()`

Renders a React component and writes output to the configured stream or file system.

- `App` — React element to render

**Example:**

```tsx twoslash
import { createReactFabric, File } from '@kubb/react-fabric'

const fabric = createReactFabric()

function Generator() {
  return (
    <File baseName="user.ts" path="./generated/user.ts">
      <File.Source isExportable>
        export type User = {'{ id: number }'}
      </File.Source>
    </File>
  )
}

await fabric.render(<Generator />)
```

### `fabric.renderToString()`

Renders a React component to a string without side effects.

- `App` — React element to render
- Returns: `Promise<string>`

**Example:**

```tsx twoslash
import { createReactFabric, Const } from '@kubb/react-fabric'

const fabric = createReactFabric()

const output = await fabric.renderToString(
  <Const name="API_URL" export type="string">
    'https://api.example.com'
  </Const>
)

console.log(output)
// export const API_URL: string = 'https://api.example.com'
```

### `fabric.waitUntilExit()`

Waits until the React render completes and all components unmount.

**Example:**

```tsx twoslash
import { createReactFabric, File } from '@kubb/react-fabric'

const fabric = createReactFabric()

await fabric.render(<File baseName="test.ts" path="./test.ts" />)
await fabric.waitUntilExit()
```

## Examples

### With File System Plugin

Generate files with React components:

::: code-group

```tsx twoslash [run.ts]
import { createReactFabric, File, Type } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/react-fabric/plugins'

const fabric = createReactFabric()

fabric.use(fsPlugin, {
  clean: { path: './generated' }
})

function Generator() {
  return (
    <>
      <File baseName="user.ts" path="./generated/types/user.ts">
        <File.Source isExportable>
          <Type name="User" export>
            {'{ id: number; name: string }'}
          </Type>
        </File.Source>
      </File>
      <br/>
      <File baseName="post.ts" path="./generated/types/post.ts">
        <File.Source isExportable>
          <Type name="Post" export>
            {'{ id: number; title: string; userId: number }'}
          </Type>
        </File.Source>
      </File>
    </>
  )
}

const output = await fabric.renderToString(<Generator />)
```

```ts [output]
export type User = { id: number; name: string }
export type Post = { id: number; title: string; userId: number }
```
:::

### With DevTools

Enable React DevTools for debugging:

::: code-group

```tsx twoslash [run.ts]
import { createReactFabric, Const } from '@kubb/react-fabric'

const fabric = createReactFabric({
  devtools: true,
  debug: true
})

function MyComponent() {
  return <Const name="API_URL" export type="string">'https://api.example.com'</Const>
}

// DevTools will open automatically
await fabric.render(<MyComponent />)
```
:::

### Custom Streams

Redirect output to custom streams:

::: code-group

```tsx [run.ts]
import { createReactFabric, Const } from '@kubb/react-fabric'
import { createWriteStream } from 'node:fs'

const fabric = createReactFabric({
  stdout: createWriteStream('./output.log'),
  stderr: process.stderr,
  debug: true
})

function MyComponent() {
  return <Const name="API_URL" export type="string">'https://api.example.com'</Const>
}

await fabric.render(<MyComponent />)

```

```ts [output.log]
Rendering:

export const API_URL:string = 'https://api.example.com'
```
:::

## FAQ

### What's the difference between createReactFabric and createFabric?

`createReactFabric()` is a wrapper that automatically adds the React plugin. Use it when building React-based generators. Use `createFabric()` for FSX or plugin-based generators.

### When should I use render() vs renderToString()?

Use `render()` when generating files (side effects like writing to disk). Use `renderToString()` for template generation or testing (pure string output).

### Can I use both React and FSX components?

No. Each Fabric instance uses either React (createReactFabric) or FSX (createFabric). Choose one based on your preferred syntax.

### How do I add plugins to React Fabric?

Call `fabric.use(pluginFunction, options)` after creating the instance. Common plugins include `fsPlugin`, `loggerPlugin`, and `barrelPlugin`.

## See also

- [React Fabric Overview](/react) - Learn React Fabric concepts
- [createFabric()](/core/create-fabric) - Core Fabric factory function
- [React Plugin](/plugins/react-plugin) - React plugin implementation details
- [File Component](/react/components/file) - Main file generation component

## Next Steps

- [Quick Start Guide](/getting-started/quick-start) - Build your first generator
- [React Components](/react/components/file) - Explore available components
- [File System Plugin](/plugins/fs-plugin) - Learn about file writing
