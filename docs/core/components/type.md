---
layout: doc
title: Type (Fabric Core)
outline: deep
---

# `Type` <Badge type="info" text="fabric-core" />

Generates TypeScript type declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Type (React Fabric)](/react/components/type).

## Usage

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Type } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Type({
  name: 'User',
  export: true
}).children(['{ id: number; name: string }'])

const output = await fabric.render(component)
```

```ts [output]
export type User = { id: number; name: string }
```
:::

## Props

### name

Name of the type.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### export

Export the type.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### JSDoc

JSDoc comments.

|           |           |
|----------:|:----------|
|     Type: | `JSDoc`   |
| Required: | `false`   |

## Examples

### Union Type

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, Type } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Type({
  name: 'Status',
  export: true
}).children(["'pending' | 'success' | 'error'"])

const output = await fabric.render(component)
```

```ts [output]
export type Status = 'pending' | 'success' | 'error'
```
:::

## See Also

- [Type (React Fabric)](/react/components/type) - React version
- [Function](/core/components/function) - Function declarations
- [Const](/core/components/const) - Constant declarations
