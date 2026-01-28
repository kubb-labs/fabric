---
layout: doc
title: Const (React Fabric)
outline: deep
---

# `Const` <Badge type="tip" text="react-fabric" />

React component for generating TypeScript constant declarations.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Const (Fabric Core)](/core/components/const).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Const } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
     <Const name="API_URL" export type="string">
      'https://api.example.com'
    </Const>
  )
}

const output = await fabric.renderToString(<Generator/>)
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

### children

Constant value.

|           |            |
|----------:|:-----------|
|     Type: | `KubbNode` |
| Required: | `false`    |


## See Also

- [Const (Fabric Core)](/core/components/const) - FSX version
- [Function](/react/components/function) - Function declarations
- [Type](/react/components/type) - Type declarations
