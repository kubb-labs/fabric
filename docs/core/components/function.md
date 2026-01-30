---
layout: doc
title: Function Component - Generate TypeScript Functions
description: Use the Function component to generate TypeScript function declarations with parameters and return types in Fabric Core.
outline: deep
---

# Function <Badge type="info" text="fabric-core" />

The Function component generates TypeScript function declarations including regular, async, and exported functions with parameters and return types.

**Use Function when:** You need to generate TypeScript function declarations programmatically.

**Perfect for:** API client methods, utility functions, SDK functions, helper generators.

> [!NOTE]
> This is the **Fabric Core** version using the functional API.
> For the React version, see [Function (React Fabric)](/react/components/function).

## Usage

Generate TypeScript function declarations with the Function component.

**Example:** Create a function with parameters and return type.

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Function } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Function({
  name: 'getUser',
  params: 'id: number',
  returnType: 'User'
}).children(['return fetch(`/users/${id}`)'])

const output = await fabric.render(component)
```

**Output:**
```ts [output]
function getUser(id: number): User {
  return fetch(`/users/${id}`)
}
```
:::

## Component Props

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

## Examples

### Async Function

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Function, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Function({
  name: 'fetchData',
  export: true,
  async: true,
  params: 'url: string',
  returnType: 'Data'
}).children([
  'const response = await fetch(url)',
  Br(),
  'return response.json()'
])

const output = await fabric.render(component)
```

```ts [output]
export async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url)
  return response.json()
}
```
:::

### With Generics

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Function } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Function({
  name: 'identity',
  export: true,
  generics: 'T',
  params: 'value: T',
  returnType: 'T'
}).children(['return value'])

const output = await fabric.render(component)
```

```ts [output]
export function identity<T>(value: T): T {
  return value
}
```
:::

## See Also

- [Function (React Fabric)](/react/components/function) - React version
- [Const](/core/components/const) - Constant declarations
- [Type](/core/components/type) - Type declarations
