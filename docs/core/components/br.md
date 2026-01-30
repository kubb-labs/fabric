---
layout: doc
title: Br Component - Line Break in Generated Code
description: Use the Br component to add line breaks in generated TypeScript code output with Fabric Core.
outline: deep
---

# Br <Badge type="info" text="fabric-core" />

The Br component generates a line break (`\n`) in the output code. Use it to control spacing between code elements.

**Use Br when:** You need explicit line breaks between generated code statements.

**Perfect for:** Spacing between functions, separating code blocks, formatting generated code.

> [!NOTE]
> This is the **Fabric Core** version. In React Fabric, use the `<br />` JSX element instead.

## Usage

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Br()

const output = await fabric.render(component)
```

```ts [output]
\n
```
:::

## Props

This component accepts no props.

## Examples

### Add Line Breaks Between Statements

```tsx twoslash
import { Br } from '@kubb/fabric-core'

const component = [
  'const x = 1',
  Br(),
  'const y = 2',
  Br(),
  'const z = 3'
]
```

### In Code Generation


::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Function, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Function({
  name: 'example',
  export: true
}).children([
  'const result = calculate()',
  Br(),
  'return result'
])

const output = await fabric.render(component)
```

```ts [output]
export function example() {
  const result = calculate()
  return result
}
```

:::

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Dedent](/core/components/dedent) - Decrease indentation
- [Function](/core/components/function) - Function declarations
