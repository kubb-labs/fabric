---
layout: doc
title: useContext Hook - Access Context Values in Fabric
description: Access custom context values in Fabric components with the useContext composable hook.
outline: deep
---

# useContext Hook

The useContext composable accesses context values from context providers in Fabric components.

**Use useContext when:** You need to access shared state, configuration, or values from parent components.

**Perfect for:** Custom context access, shared configuration, implementing context patterns.

> [!NOTE]
> This hook is used internally by `@kubb/react-fabric` for React context integration.


## Usage

Access values from a specific context key.

**Example:** Access App context values.

```ts twoslash
import { useContext } from '@kubb/fabric-core'
import { AppContext } from '@kubb/fabric-core'

function MyComponent() {
  const { meta } = useContext(AppContext)

  return `Version: ${(meta as { version: string }).version}`
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Context<T>` | The context key to retrieve |
| `defaultValue` | `T` | Optional default value if context is not found |

## Return Value

Returns the value stored in the specified context, or the default value if not found.

## When to Use

Use `useContext` when you need to:
- Access shared state from a context provider
- Read configuration values from parent components
- Implement custom context access patterns

## Examples

### With Default Value

```ts twoslash
import { useContext, createContext } from '@kubb/fabric-core'

const ThemeContext = createContext<{ mode: 'light' | 'dark' }>({ mode: 'light' })

function MyComponent() {
  const theme = useContext(ThemeContext, { mode: 'light' })

  return theme
}
```

## See Also

- [useApp](/core/composables/use-app) - Access App context
- [useFile](/core/composables/use-file) - Access File context
