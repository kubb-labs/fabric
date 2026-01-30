---
layout: doc
title: Const Component React - Generate TypeScript Constants
description: Generate TypeScript const declarations using React JSX. Component-based constant generation for Fabric code generators.
outline: deep
---

# Const <Badge type="tip" text="react-fabric" />

Generate TypeScript constant declarations using React JSX syntax. Use this component when building code generators with React-based Fabric runtime for typed constant values.

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

## What is the Const Component?

The `Const` component generates TypeScript constant declarations using React JSX. It provides a declarative way to create typed constants in your code generators with full control over export, typing, and const assertions.

## Why Use Const in React?

- **Type-safe values** - Add TypeScript type annotations to constants
- **Component-based** - Use familiar React patterns for const generation
- **Const assertions** - Support for `as const` with the `asConst` prop
- **Flexible exports** - Control exported vs internal constants

## Common Use Cases

- Generate configuration constants (API URLs, feature flags)
- Create lookup tables and mappings
- Build enum-like constant objects with `as const`
- Generate shared constant values across files

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


## FAQ

### What's the difference between type and asConst?

The `type` prop adds an explicit type annotation (`: string`). The `asConst` prop adds a const assertion (`as const`), which makes TypeScript infer the most specific type. Use `asConst` for literal types and readonly objects.

### Can I export constants conditionally?

Yes. Set the `export` prop to `true` for exported constants or `false` (default) for internal constants.

### How do I generate object constants?

Pass a string with object literal syntax as children. Combine with `asConst={true}` for readonly objects with literal types.

## Related Components

- [Const (Fabric Core)](/core/components/const) - FSX version for non-React workflows
- [Function Component](/react/components/function) - Generate function declarations
- [Type Component](/react/components/type) - Generate type declarations

## Next Steps

- [Learn React Fabric basics](/react) - Understand the React runtime
- [Quick Start Guide](/getting-started/quick-start) - Build your first generator
