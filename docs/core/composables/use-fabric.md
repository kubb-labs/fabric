---
layout: doc
title: useFabric Hook - Access Fabric Fabric Context & Metadata
description: Access Fabric context metadata and lifecycle control in Fabric components with the useFabric composable hook.
outline: deep
---

# useFabric Hook

The useFabric composable accesses the Fabric context containing metadata and lifecycle control within Fabric components.

**Use useFabric when:** You need to access metadata from the Fabric component or exit the rendering process.

**Perfect for:** Shared configuration, version info, global state, early exit conditions.

## Usage

Access Fabric metadata and lifecycle control from within components.

**Example:** Access metadata from Fabric context.

```ts twoslash
import { useFabric } from '@kubb/fabric-core'

const fabric = useFabric()
console.log(fabric.meta)
fabric.exit() // exit
```

## Return Value

Returns the current Fabric context containing:

|        |            |                                |
|-------:|:-----------|:-------------------------------|
| `meta` | `TMeta`    | Metadata passed to Fabric component|
| `exit` | `() => void` | Function to exit the render    |

## When to Use

Use `useFabric` when you need to:
- Access metadata defined in the `Fabric` component
- Exit the rendering process early
- Share global state across components

## Examples

### Access Metadata

```tsx twoslash
import { useFabric } from '@kubb/fabric-core'

function MyComponent() {
  const { meta } = useFabric<{ version: string }>()

  return `// Version: ${meta.version}`
}
```

### Exit Early

```ts twoslash
import { useFabric } from '@kubb/fabric-core'

function ConditionalComponent({ shouldRender }: { shouldRender: boolean }) {
  const { exit } = useFabric()

  if (!shouldRender) {
    exit()
    return null
  }

  return 'Content'
}
```

## See Also

- [Fabric](/core/components/fabric) - Fabric component
- [useContext](/core/composables/use-context) - Generic context access
- [useLifecycle](/core/composables/use-lifecycle) - Lifecycle control

