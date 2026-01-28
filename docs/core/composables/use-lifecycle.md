---
layout: doc
title: useLifecycle
outline: deep
---

# `useLifecycle`

Composable for controlling the rendering lifecycle and exit behavior.

## Usage

```tsx twoslash
import { useLifecycle } from '@kubb/fabric-core'

function MyComponent() {
  const { exit } = useLifecycle()

  exit()

  return null
}
```

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `exit` | `(error?: Error) => void` | Function to stop rendering and exit the process |

## When to Use

Use `useLifecycle` when you need to:
- Stop the rendering process early
- Exit with an error condition
- Implement conditional rendering logic that may abort the generation

## Examples

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
