---
layout: doc
title: Const (Fabric Core)
outline: deep
---

# Const <Badge type="info" text="fabric-core" />

Generates TypeScript constant declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Const (React Fabric)](/api/react-fabric/components/const).

## Package

```bash
@kubb/fabric-core
```

## Usage

Uses Fabric's functional API (not JSX):

```ts [basic-const.ts]
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

## API

```ts
Const(props: ConstProps): ComponentBuilder
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name of the constant |
| `export` | `boolean` | `false` | Export the constant |
| `type` | `string` | - | Type annotation |
| `asConst` | `boolean` | `false` | Use const assertion |
| `JSDoc` | `JSDoc` | - | JSDoc comments |

### Methods

| Method | Description |
|--------|-------------|
| `.children(nodes)` | Add constant value |

## Examples

### Const Assertion

```ts [as-const.ts]
const component = Const({
  name: 'config',
  export: true,
  asConst: true
}).children([
  '{ apiUrl: "https://api.example.com", timeout: 5000 }'
])
```

## See Also

- [Const (React Fabric)](/api/react-fabric/components/const) - React version
- [Function](/api/fabric-core/components/function) - Function declarations
- [Type](/api/fabric-core/components/type) - Type declarations
