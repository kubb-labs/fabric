---
layout: doc
title: Function (React Fabric)
outline: deep
---

# Function <Badge type="tip" text="react-fabric" />

React component for generating TypeScript function declarations.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Function (Fabric Core)](/api/fabric-core/components/function).

## Package

```bash
@kubb/react-fabric
```

## Usage

Uses React (not FSX):

```tsx [function.tsx]
import { Function } from '@kubb/react-fabric'

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
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name of the function |
| `export` | `boolean` | `false` | Export the function |
| `async` | `boolean` | `false` | Make function async |
| `params` | `string` | - | Function parameters |
| `returnType` | `string` | - | Return type annotation |
| `generics` | `string \| string[]` | - | TypeScript generics |
| `JSDoc` | `JSDoc` | - | JSDoc comments |
| `children` | `ReactNode` | - | Function body |

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

- [Function (Fabric Core)](/api/fabric-core/components/function) - FSX version
- [Const](/api/react-fabric/components/const) - Constant declarations
- [Type](/api/react-fabric/components/type) - Type declarations
