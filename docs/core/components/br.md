---
layout: doc
title: Br
outline: deep
---

# Br

Generates a line break in the output.

## Usage

```ts [basic.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fabric-core'
import { Br } from '@kubb/fabric-core'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = [
  'const x = 1',
  Br(),
  'const y = 2',
  Br(),
  'const z = 3'
]

const output = await fabric.render(component)
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Dedent](/core/components/dedent) - Decrease indentation
