---
layout: doc
title: Indent
outline: deep
---

# Indent

Increases indentation level in the output.

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

- [Dedent](/core/components/dedent) - Decrease indentation
- [Br](/core/components/br) - Line break
