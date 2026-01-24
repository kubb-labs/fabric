---
layout: doc
title: Dedent
outline: deep
---

# Dedent

Decreases indentation level in the output.

## Usage

```ts [basic.ts]
import { createFabric, createComponent } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Indent, Dedent, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const App = createComponent('App', () => {
  return [
    'function example() {',
    Br(),
    Indent(),
    'const x = 1',
    Br(),
    'return x',
    Br(),
    Dedent(),
    '}'
  ]
})

const output = await fabric.render(App())
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Br](/core/components/br) - Line break
