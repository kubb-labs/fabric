---
layout: doc
title: Dedent
outline: deep
---

# Dedent

Decreases indentation level in the output.

## Usage

```tsx [basic.tsx]
import { Indent, Dedent, Br } from '@kubb/fabric-core'

<>
  function example() {'{'}<Br />
  <Indent />
    const x = 1<Br />
    return x<Br />
  <Dedent />
  {'}'}
</>
```

## See Also

- [Indent](/core/components/indent) - Increase indentation
- [Br](/core/components/br) - Line break
