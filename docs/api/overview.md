---
layout: doc
title: Overview
outline: deep
---

# Fabric Core vs React Fabric

Fabric provides two packages with similar component names but different implementations.

## Fabric Core (@kubb/fabric-core)

Uses **FSX** (Fabric's custom JSX renderer) and `createComponent`.

### Characteristics
- Custom JSX runtime (not React)
- Uses `createComponent` from fabric-core
- Works with `FabricNode` types
- Lighter weight, no React dependency
- Direct control over rendering

### Example

```tsx [fabric-core.tsx]
import { createComponent } from '@kubb/fabric-core'

// Custom component using createComponent
export const MyComponent = createComponent('MyComponent', ({ children }) => {
  return children
})
```

## React Fabric (@kubb/react-fabric)

Uses **React** with standard JSX and React components.

### Characteristics
- Standard React components
- Uses React hooks and features
- Works with React ecosystem
- Familiar React patterns
- `ReactNode` and `ReactElement` types

### Example

```tsx [react-fabric.tsx]
import type { ReactNode } from 'react'

// React component
export function MyComponent({ children }: { children?: ReactNode }) {
  return <>{children}</>
}
```

## Same Names, Different Implementations

Both packages export components with the same names:

| Component | fabric-core | react-fabric |
|-----------|-------------|--------------|
| App | FSX + createComponent | React component |
| File | FSX + createComponent | React component |
| Function | FSX + createComponent | React component |
| Const | FSX + createComponent | React component |
| Type | FSX + createComponent | React component |

## When to Use Which?

### Use fabric-core when:
- Building custom generators without React
- Want minimal dependencies
- Need direct control over rendering
- Working in non-React environments

### Use react-fabric when:
- Integrating with React applications
- Want familiar React patterns
- Need React ecosystem features
- Building React-based generators

## Import Paths

```ts
// Fabric Core
import { App, File, Function } from '@kubb/fabric-core'

// React Fabric  
import { App, File, Function } from '@kubb/react-fabric'
```

## Documentation Structure

Our documentation separates the two packages:

- **Fabric Core** - `/api/fabric-core/components/...`
- **React Fabric** - `/api/react-fabric/components/...`

Each component page clearly indicates which package it belongs to with a badge.
