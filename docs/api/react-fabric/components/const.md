---
layout: doc
title: Const (React Fabric)
outline: deep
---

# Const <Badge type="tip" text="react-fabric" />

React component for generating TypeScript constant declarations.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Const (Fabric Core)](/api/fabric-core/components/const).

## Package

```bash
@kubb/react-fabric
```

## Usage

Uses React (not FSX):

```tsx [const.tsx]
import { Const } from '@kubb/react-fabric'

export function Generator() {
  return (
    <Const name="API_URL" export type="string">
      'https://api.example.com'
    </Const>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name of the constant |
| `export` | `boolean` | `false` | Export the constant |
| `type` | `string` | - | Type annotation |
| `asConst` | `boolean` | `false` | Use const assertion |
| `JSDoc` | `JSDoc` | - | JSDoc comments |
| `children` | `ReactNode` | - | Constant value |

## Examples

### Basic Constant

```tsx [basic.tsx]
<Const name="API_URL" export type="string">
  'https://api.example.com'
</Const>
```

### Const Assertion

```tsx [as-const.tsx]
<Const name="config" export asConst>
  {'{'}
    apiUrl: 'https://api.example.com',
    timeout: 5000
  {'}'}
</Const>
```

## See Also

- [Const (Fabric Core)](/api/fabric-core/components/const) - FSX version
- [Function](/api/react-fabric/components/function) - Function declarations
- [Type](/api/react-fabric/components/type) - Type declarations
