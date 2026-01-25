---
layout: doc
title: Const (Fabric Core)
outline: deep
---

# Const <Badge type="info" text="fabric-core" />

Generates TypeScript constant declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Const (React Fabric)](/react/components/const).

## Usage

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Const } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Const({
  name: 'API_URL',
  export: true,
  type: 'string'
}).children(["'https://api.example.com'"])

const output = await fabric.render(component)
```

```ts [output]
export const API_URL: string = 'https://api.example.com'
```
:::

## Props

### name

Name of the constant.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### export

Export the constant.

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### type

Type annotation.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### asConst

Use const assertion.

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


## See Also

- [Const (React Fabric)](/react/components/const) - React version
- [Function](/core/components/function) - Function declarations
- [Type](/core/components/type) - Type declarations
