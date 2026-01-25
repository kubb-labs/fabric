---
layout: doc
title: Function (React Fabric)
outline: deep
---

# Function <Badge type="tip" text="react-fabric" />

React component for generating TypeScript function declarations.

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

## Examples

### Basic Function

```tsx [basic.tsx]
<Function name="getUser" params="id: number" returnType="User">
  return fetch(`/users/${'${id}'}`)
</Function>
```

### With Generics

```tsx [generics.tsx]
<Function
  name="getData"
  export
  async
  generics="TData"
  returnType="number"
>
  return 2
</Function>
```

## See Also

- [Function (Fabric Core)](/core/components/function) - FSX version
- [Const](/react/components/const) - Constant declarations
- [Type](/react/components/type) - Type declarations
