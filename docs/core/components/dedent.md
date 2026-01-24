---
layout: doc
title: Dedent
outline: deep
---

# Dedent

Decreases indentation level in the output.

## Usage

```ts [basic.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core'
import { Indent, Dedent, Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = [
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

const output = await fabric.render(component)
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Br](/core/components/br) - Line break
