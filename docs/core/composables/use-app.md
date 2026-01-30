---
layout: doc
title: useApp Hook - Access Fabric App Context & Metadata
description: Access App context metadata and lifecycle control in Fabric components with the useApp composable hook.
outline: deep
---

# useApp Hook

The useApp composable accesses the App context containing metadata and lifecycle control within Fabric components.

**Use useApp when:** You need to access metadata from the App component or exit the rendering process.

**Perfect for:** Shared configuration, version info, global state, early exit conditions.

## Usage

Access App metadata and lifecycle control from within components.

**Example:** Access metadata from App context.

```ts twoslash
import { useApp } from '@kubb/fabric-core'

const app = useApp()
console.log(app.meta)
app.exit() // exit the app
```

## Return Value

Returns the current App context containing:

|        |            |                                |
|-------:|:-----------|:-------------------------------|
| `meta` | `TMeta`    | Metadata passed to App component|
| `exit` | `() => void` | Function to exit the render    |

## When to Use

Use `useApp` when you need to:
- Access metadata defined in the `App` component
- Exit the rendering process early
- Share global state across components

## Examples

### Access Metadata

```tsx twoslash
import { useApp } from '@kubb/fabric-core'

function MyComponent() {
  const { meta } = useApp<{ version: string }>()

  return `// Version: ${meta.version}`
}
```

### Exit Early

```ts twoslash
import { useApp } from '@kubb/fabric-core'

function ConditionalComponent({ shouldRender }: { shouldRender: boolean }) {
  const { exit } = useApp()

  if (!shouldRender) {
    exit()
    return null
  }

  return 'Content'
}
```

## See Also

- [App](/core/components/app) - App component
- [useContext](/core/composables/use-context) - Generic context access
- [useLifecycle](/core/composables/use-lifecycle) - Lifecycle control

