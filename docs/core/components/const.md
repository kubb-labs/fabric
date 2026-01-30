---
layout: doc
title: Const Component - Generate TypeScript Constants
description: Use the Const component to generate TypeScript constant declarations with type annotations in Fabric Core.
outline: deep
---

# Const <Badge type="info" text="fabric-core" />

The Const component generates TypeScript constant declarations with optional type annotations and export modifiers.

**Use Const when:** You need to generate TypeScript const declarations programmatically.

**Perfect for:** API URLs, configuration constants, enum alternatives, SDK constants.

> [!NOTE]
> This is the **Fabric Core** version using the functional API.
> For the React version, see [Const (React Fabric)](/react/components/const).

## Usage

Generate TypeScript constant declarations with the Const component.

**Example:** Create an exported API URL constant with type annotation.

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

## Component Props

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
