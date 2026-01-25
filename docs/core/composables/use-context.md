---
layout: doc
title: useContext
outline: deep
---

# useContext

React-style composable for accessing context values.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Context<T>` | The context key |
| `defaultValue` | `TValue` | Optional default value |

## Usage

### Basic Usage

```ts twoslash
import { useContext } from '@kubb/fabric-core'
import { AppContext } from '@kubb/fabric-core'

function MyComponent() {
  const { meta } = useContext(AppContext)

  return meta
}
```

### With Default Value

```ts twoslash
import { useContext, createContext } from '@kubb/fabric-core'

const ThemeContext = createContext<{ mode: 'light' | 'dark' }>()

function MyComponent() {
  const theme = useContext(ThemeContext, { mode: 'light' })

  return theme
}
```

## See Also

- [useApp](/core/composables/use-app) - Access App context
- [useFile](/core/composables/use-file) - Access File context
