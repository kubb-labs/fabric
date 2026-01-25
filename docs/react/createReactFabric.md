---
layout: doc
title: createReactFabric
outline: deep
---

# createReactFabric

Creates a Fabric instance pre-configured with React support for component-based file generation.

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

await fabric.render(<Generator />)
await fabric.waitUntilExit()
```

```ts [output]
export const API_URL: string = 'https://api.example.com'
```
:::

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

```tsx twoslash
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

await fabric.render(<Generator />)
await fabric.waitUntilExit()
```

### With DevTools

Enable React DevTools for debugging:

```tsx twoslash
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

### Custom Streams

Redirect output to custom streams:

```tsx
import { createReactFabric, Const } from '@kubb/react-fabric'
import { createWriteStream } from 'fs'

const fabric = createReactFabric({
  stdout: createWriteStream('./output.log'),
  stderr: process.stderr
})

function MyComponent() {
  return <Const name="API_URL" export type="string">'https://api.example.com'</Const>
}

await fabric.render(<MyComponent />)
```

## See Also

- [createFabric](/core/create-fabric) - Core Fabric factory
- [reactPlugin](/plugins/react-plugin) - React plugin documentation
- [File](/react/components/file) - File component
- [fsPlugin](/plugins/fs-plugin) - File system plugin
