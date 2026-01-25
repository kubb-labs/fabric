---
layout: doc
title: useLifecycle
outline: deep
---

# useLifecycle

Composable for controlling generation lifecycle.


## Returns

| Property | Type | Description |
|----------|------|-------------|
| `exit` | `(error?: Error) => void` | Function to stop rendering |

## Usage

### Basic Usage

```tsx twoslash
import { useLifecycle } from '@kubb/fabric-core'

function MyComponent() {
  const { exit } = useLifecycle()

  exit()

  return null
}
```

### Exit with Error

```tsx twoslash
import { useLifecycle } from '@kubb/fabric-core'

function MyComponent({ data }: { data?: unknown }) {
  const { exit } = useLifecycle()

  if (!data) {
    exit(new Error('Data is required'))
    return null
  }

  return null
}
```

## See Also

- [useApp](/core/composables/use-app) - Access App context
