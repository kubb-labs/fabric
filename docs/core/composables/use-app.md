---
layout: doc
title: useApp
outline: deep
---

# useApp

Composable for accessing the App context with metadata and exit function.

## Usage

```ts [use-app-example.ts]
import { useApp } from '@kubb/fabric-core'

const app = useApp()
console.log(app.meta)
app.exit()
```

## Return Value

Returns the current App context containing:

|        |            |                                |
|-------:|:-----------|:-------------------------------|
| `meta` | `object`   | Metadata passed to App component|
| `exit` | `Function` | Function to exit the render    |

## When to Use

Use `useApp` when you need to:
- Access metadata defined in the `App` component
- Exit the rendering process early
- Share global state across components

## Examples

### Access Metadata

```tsx [access-metadata.tsx]
import { useApp } from '@kubb/fabric-core'

function MyComponent() {
  const { meta } = useApp<{ version: string }>()
  
  return `// Version: ${meta.version}`
}

// In App
<App meta={{ version: '1.0.0' }}>
  <MyComponent />
</App>
```

### Exit Early

```tsx [exit-early.tsx]
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

- [App](/core/components/app) — App component
- [useContext](/core/composables/use-context) — Generic context access
