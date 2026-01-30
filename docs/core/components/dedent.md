---
layout: doc
title: Dedent Component - Decrease Code Indentation
description: Use the Dedent component to decrease indentation levels in generated TypeScript code with Fabric Core.
outline: deep
---

# Dedent <Badge type="info" text="fabric-core" />

The Dedent component decreases the indentation level in generated code. Use with Indent to control code block formatting.

**Use Dedent when:** You need to decrease indentation after code blocks, closing braces, or nested structures.

**Perfect for:** Closing function bodies, exiting nested blocks, maintaining proper code formatting.

> [!NOTE]
> This is the **Fabric Core** version. In React Fabric, use the `<dedent />` JSX element instead.

## Usage

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, Indent, Dedent, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = App().children([
  'function example() {',
  Br(),
  Indent(),
  'return true',
  Br(),
  Dedent(),
  '}'
])

const output = await fabric.render(component)
```

```ts [output]
function example() {
  return true
}
```
:::

## Props

This component accepts no props.

## Examples

### Multi-Level Nesting

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, Indent, Dedent, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = App().children([
  'switch (value) {',
  Br(),
  Indent(),
  'case 1:',
  Br(),
  Indent(),
  'doSomething()',
  Br(),
  'break',
  Br(),
  Dedent(),
  'default:',
  Br(),
  Indent(),
  'doDefault()',
  Br(),
  Dedent(),
  Dedent(),
  '}'
])

const output = await fabric.render(component)
```

```ts [output]
switch (value) {
  case 1:
    doSomething()
    break
  default:
    doDefault()
}
```
:::

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Br](/core/components/br) - Line breaks
- [Function](/core/components/function) - Function declarations
