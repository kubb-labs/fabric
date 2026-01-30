---
layout: doc
title: Function Component React - Generate TypeScript Functions
description: Generate TypeScript function declarations using React JSX. Component-based function generation for Fabric code generators.
outline: deep
---

# Function <Badge type="tip" text="react-fabric" />

Generate TypeScript function declarations using React JSX syntax. Use this component when building code generators with React-based Fabric runtime for declarative function generation.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Function (Fabric Core)](/core/components/function).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Function } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
    <Function
      name="getUser"
      export
      async
      params="id: number"
      returnType="User"
    >
      const response = await fetch(`/users/${'${id}'}`){'\n'}
      return response.json()
    </Function>
  )
}

const output = await fabric.renderToString(<Generator/>)
```

```ts [output]
export async function getUser(id: number): User {
  const response = await fetch(`/users/${id}`)
  return response.json()
}
```
:::

## What is the Function Component?

The `Function` component generates TypeScript function declarations using React JSX. It provides a declarative way to create functions in your code generators with full support for async, generics, parameters, and return types.

## Why Use Function in React?

- **Declarative syntax** - Define functions using clean JSX props
- **Full TypeScript support** - Generics, params, and return types
- **Async functions** - Built-in async/await support
- **Component-based** - Nest within other React Fabric components

## Common Use Cases

- Generate API client functions with proper types
- Create utility functions programmatically
- Build async data fetching functions
- Generate type-safe handler functions

## Props

### name

Name of the function.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### export

Export the function.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### async

Make function async.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### params

Function parameters.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### returnType

Return type annotation.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### generics

TypeScript generics.

|           |                       |
|----------:|:----------------------|
|     Type: | `string \| string[]`  |
| Required: | `false`               |

### JSDoc

JSDoc comments.

|           |           |
|----------:|:----------|
|     Type: | `JSDoc`   |
| Required: | `false`   |

### children

Function body.

|           |            |
|----------:|:-----------|
|     Type: | `KubbNode` |
| Required: | `false`    |

## FAQ

### How do I add multiple parameters?

Pass a comma-separated string to the `params` prop: `params="id: number, options: RequestOptions"`.

### Can I use generics?

Yes. Pass a single generic as a string (`generics="T"`) or multiple as an array (`generics={['T', 'U']}`).

### What's the difference between async and Promise return type?

Use `async={true}` to generate `async function`. The return type is automatically wrapped in `Promise<>` if you specify a `returnType`.

## Related Components

- [Function (Fabric Core)](/core/components/function) - FSX version for non-React workflows
- [Const Component](/react/components/const) - Generate constant declarations
- [Type Component](/react/components/type) - Generate type declarations

## Next Steps

- [Learn React Fabric basics](/react) - Understand the React runtime
- [Quick Start Guide](/getting-started/quick-start) - Build your first generator
