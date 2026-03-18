---
layout: doc
title: Indent Component - Increase Code Indentation
description: Use the Indent component to increase indentation levels in generated TypeScript code with Fabric Core.
outline: deep
---

# Indent <Badge type="info" text="fabric-core" />

The Indent component increases the indentation level for child content in generated code. Use with Dedent to control code block formatting.

**Use Indent when:** You need to increase indentation inside functions, if statements, or code blocks.

**Perfect for:** Formatting function bodies, nested code blocks, conditional statements.

> [!NOTE]
> This is the **Fabric Core** version. In React Fabric, use the `<indent />` JSX element instead.

## Usage

::: code-group

```tsx twoslash [run.ts]
import { createFabric, Fabric, Indent, Dedent, Br } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Fabric().children([
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

::: code-group

```tsx twoslash [run.ts]
import { createFabric, createComponent, Indent, Dedent, Br } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component =  createComponent('component', ()=>{
  return [
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
})

const output = await fabric.render(component())
```

```ts [output]
if (condition) {
  if (nested) {
    doSomething()
  }
}
```
:::

### With Function Component

::: code-group

```tsx twoslash [run.ts]
import { createFabric, Fabric, Indent, Dedent, Br } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = Fabric().children([
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

```ts [output]
class Example {
  constructor() {
    this.value = 0
  }
}
```
:::

## See Also

- [Dedent](/core/components/dedent) - Decrease indentation
- [Br](/core/components/br) - Line breaks
- [Function](/core/components/function) - Function declarations
