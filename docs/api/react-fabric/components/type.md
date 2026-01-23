---
layout: doc
title: Type (React Fabric)
outline: deep
---

# Type <Badge type="tip" text="react-fabric" />

React component for generating TypeScript type declarations.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Type (Fabric Core)](/api/fabric-core/components/type).

## Package

```bash
@kubb/react-fabric
```

## Usage

Uses React (not FSX):

```tsx [type.tsx]
import { Type } from '@kubb/react-fabric'

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
```

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
|     Type: | `ReactNode` |
| Required: | `false`    |

## Examples

### Basic Type

```tsx [basic.tsx]
<Type name="User" export>
  {'{'} id: number; name: string {'}'}
</Type>
```

### Union Type

```tsx [union.tsx]
<Type name="Status" export>
  'pending' | 'success' | 'error'
</Type>
```

## See Also

- [Type (Fabric Core)](/api/fabric-core/components/type) - FSX version
- [Function](/api/react-fabric/components/function) - Function declarations
- [Const](/api/react-fabric/components/const) - Constant declarations
