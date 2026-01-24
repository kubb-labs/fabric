---
layout: doc
title: Function (Fabric Core)
outline: deep
---

# Function <Badge type="info" text="fabric-core" />

Generates TypeScript function declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Function (React Fabric)](/react/components/function).

## Package

```bash
@kubb/fabric-core
```

## Usage

Uses Fabric's functional API (not JSX):

```ts [basic-function.ts]
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

```ts [async.ts]
const component = Function({
  name: 'fetchData',
  export: true,
  async: true,
  params: 'url: string',
  returnType: 'Data'
}).children([
  'const response = await fetch(url)',
  'return response.json()'
])
```

### With Generics

```ts [generics.ts]
const component = Function({
  name: 'identity',
  export: true,
  generics: 'T',
  params: 'value: T',
  returnType: 'T'
}).children(['return value'])
```

## See Also

- [Function (React Fabric)](/react/components/function) - React version
- [Const](/core/components/const) - Constant declarations
- [Type](/core/components/type) - Type declarations
