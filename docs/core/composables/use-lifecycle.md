---
layout: doc
title: useLifecycle Hook - Control Fabric Rendering Lifecycle
description: Control rendering lifecycle and exit behavior in Fabric components with the useLifecycle hook.
outline: deep
---

# useLifecycle Hook

The useLifecycle composable provides lifecycle control including the ability to exit rendering early or with errors.

**Use useLifecycle when:** You need to stop rendering early based on conditions or exit with errors.

**Perfect for:** Validation failures, conditional generation, error handling.

## Usage

Exit the rendering process programmatically from within components.

**Example:** Exit rendering early.

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
