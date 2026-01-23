---
layout: doc
title: Function (Fabric Core)
outline: deep
---

# Function <Badge type="info" text="fabric-core" />

Generates TypeScript function declarations.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> For the React version, see [Function (React Fabric)](/api/react-fabric/components/function).

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

## API

```ts
Function(props: FunctionProps): ComponentBuilder
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name of the function |
| `export` | `boolean` | `false` | Export the function |
| `async` | `boolean` | `false` | Make function async |
| `params` | `string` | - | Function parameters |
| `returnType` | `string` | - | Return type annotation |
| `generics` | `string \| string[]` | - | TypeScript generics |
| `JSDoc` | `JSDoc` | - | JSDoc comments |

### Methods

| Method | Description |
|--------|-------------|
| `.children(nodes)` | Add function body |

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

- [Function (React Fabric)](/api/react-fabric/components/function) - React version
- [Const](/api/fabric-core/components/const) - Constant declarations
- [Type](/api/fabric-core/components/type) - Type declarations
