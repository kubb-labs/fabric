---
layout: doc
title: Type (React Fabric)
outline: deep
---

# `Type` <Badge type="tip" text="react-fabric" />

React component for generating TypeScript type declarations.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Type (Fabric Core)](/core/components/type).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Type } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
    <Type name="User" export>
      {'{'}
        id: number
        name: string
      {'}'}
    </Type>
  )
}

const output = await fabric.renderToString(<Generator/>)
```

```ts [output]
export type User = {
  id: number
  name: string
}
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

### children

Type definition.

|           |            |
|----------:|:-----------|
|     Type: | `KubbNode` |
| Required: | `false`    |

## See Also

- [Type (Fabric Core)](/core/components/type) - FSX version
- [Function](/react/components/function) - Function declarations
- [Const](/react/components/const) - Constant declarations
