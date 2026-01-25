---
layout: doc
title: Br (Fabric Core)
outline: deep
---

# Br <Badge type="info" text="fabric-core" />

Generates a line break in the output.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> In React Fabric, use the `<br />` JSX element instead.

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

```tsx twoslash
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
// export function example() {
//   const result = calculate()
//   
//   return result
// }
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Dedent](/core/components/dedent) - Decrease indentation
- [Function](/core/components/function) - Function declarations
