---
layout: doc
title: Br
outline: deep
---

# Br

Generates a line break in the output.

## Usage

```ts [basic.ts]
import { createFabric, createComponent } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core/plugins'
import { Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const App = createComponent('App', () => {
  return [
    'const x = 1',
    Br(),
    'const y = 2',
    Br(),
    'const z = 3'
  ]
})

const output = await fabric.render(App())
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Dedent](/core/components/dedent) - Decrease indentation
