---
layout: doc
title: useContext
outline: deep
---

# useContext

React-style composable for accessing context values.

## Signature

```ts
function useContext<T>(key: Context<T>): T
function useContext<T, TValue = T>(
  key: Context<T>,
  defaultValue: TValue
): NonNullable<T> | TValue
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Context<T>` | The context key |
| `defaultValue` | `TValue` | Optional default value |

## Usage

### Basic Usage

```ts [basic.ts]
import { useContext } from '@kubb/fabric-core'
import { AppContext } from '@kubb/fabric-core/contexts'

function MyComponent() {
  const { meta } = useContext(AppContext)

  return <>{/* Your component */}</>
}
```

### With Default Value

```ts [default.ts]
import { useContext, createContext } from '@kubb/fabric-core'

const ThemeContext = createContext<{ mode: 'light' | 'dark' }>()

function MyComponent() {
  const theme = useContext(ThemeContext, { mode: 'light' })

  return <>{/* Your component */}</>
}
```

## See Also

- [useApp](/api/fabric-core/composables/use-app) - Access App context
- [useFile](/api/fabric-core/composables/use-file) - Access File context
