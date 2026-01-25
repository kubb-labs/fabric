---
layout: doc
title: Indent (Fabric Core)
outline: deep
---

# Indent <Badge type="info" text="fabric-core" />

Increases indentation level in the output.

> [!NOTE]
> This is the **fabric-core** version using the functional API.
> In React Fabric, use the `<indent />` JSX element instead.

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

### Control Nested Indentation

```tsx twoslash
import { Indent, Dedent, Br } from '@kubb/fabric-core'

const component = [
  'if (condition) {',
  Br(),
  Indent(),
  'if (nested) {',
  Br(),
  Indent(),
  'doSomething()',
  Br(),
  Dedent(),
  '}',
  Br(),
  Dedent(),
  '}'
]
```

### With Function Component

```tsx twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { App, Indent, Dedent, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = App().children([
  'class Example {',
  Br(),
  Indent(),
  'constructor() {',
  Br(),
  Indent(),
  'this.value = 0',
  Br(),
  Dedent(),
  '}',
  Br(),
  Dedent(),
  '}'
])

const output = await fabric.render(component)
```

## See Also

- [Dedent](/core/components/dedent) - Decrease indentation
- [Br](/core/components/br) - Line breaks
- [Function](/core/components/function) - Function declarations
