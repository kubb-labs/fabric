---
layout: doc
title: Function (Fabric Core)
outline: deep
---

# `Function` <Badge type="info" text="fabric-core" />

Generates TypeScript function declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Function (React Fabric)](/react/components/function).

## Usage

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

```ts [output]
function getUser(id: number): User {
  return fetch(`/users/${id}`)
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
