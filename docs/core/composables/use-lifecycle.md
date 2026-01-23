---
layout: doc
title: useLifecycle
outline: deep
---

# useLifecycle

Composable for controlling generation lifecycle.

## Signature

```ts
function useLifecycle(): {
  exit: (error?: Error) => void
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `exit` | `(error?: Error) => void` | Function to stop rendering |

## Usage

### Basic Usage

```tsx [exit.tsx]
import { useLifecycle } from '@kubb/fabric-core'

function MyComponent() {
  const { exit } = useLifecycle()

  if (invalidCondition) {
    exit()
  }

  return <>{/* Your component */}</>
}
```

### Exit with Error

```tsx [exit-error.tsx]
import { useLifecycle } from '@kubb/fabric-core'

function MyComponent({ data }: { data?: unknown }) {
  const { exit } = useLifecycle()

  if (!data) {
    exit(new Error('Data is required'))
    return null
  }

  return <>{/* Your component */}</>
}
```

## See Also

- [useApp](/core/composables/use-app) - Access App context
