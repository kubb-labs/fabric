---
layout: doc
title: Type Component React - Generate TypeScript Types JSX
description: Generate TypeScript type declarations using React JSX. Component-based type generation for Fabric code generators.
outline: deep
---

# Type <Badge type="tip" text="react-fabric" />

Generate TypeScript type declarations using React JSX syntax. Use this component when building code generators with React-based Fabric runtime for clean, component-driven type generation.

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

## What is the Type Component?

The `Type` component generates TypeScript type declarations using React JSX. It provides a declarative way to create types in your code generators with full TypeScript support.

## Why Use Type in React?

- **Component-based** - Use familiar React patterns for type generation
- **Type-safe** - Full TypeScript IntelliSense and validation
- **Composable** - Nest within other React Fabric components
- **Declarative** - Clean JSX syntax matches output structure

## Common Use Cases

- Generate type definitions for API responses
- Create shared type libraries
- Build complex nested types programmatically
- Generate types from schemas or specifications

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

## FAQ

### When should I use Type vs Interface?

Use `Type` for all type aliases and unions. Fabric doesn't generate `interface` declarations - types provide more flexibility for code generation patterns.

### Can I nest types inside the component?

Yes. Use React children to define the type body. You can include any valid TypeScript type syntax as strings or interpolated values.

### How do I add JSDoc comments?

Pass the `JSDoc` prop with a configuration object containing the description and tags you want to include.

## Related Components

- [Type (Fabric Core)](/core/components/type) - FSX version for non-React workflows
- [Function Component](/react/components/function) - Generate function declarations
- [Const Component](/react/components/const) - Generate constant declarations

## Next Steps

- [Learn React Fabric basics](/react) - Understand the React runtime
- [Quick Start Guide](/getting-started/quick-start) - Build your first generator
