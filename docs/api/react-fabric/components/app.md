---
layout: doc
title: App (React Fabric)
outline: deep
---

# App <Badge type="tip" text="react-fabric" />

React component providing App context with metadata.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [App (Fabric Core)](/api/fabric-core/components/app).

## Package

```bash
@kubb/react-fabric
```

## Usage

Uses React (not FSX):

```tsx [app.tsx]
import { App, File } from '@kubb/react-fabric'

export function Generator() {
  return (
    <App>
      <File baseName="user.ts" path="./generated/user.ts">
        <File.Source isExportable>
          export type User = {'{'} id: number {'}'}
        </File.Source>
      </File>
    </App>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `meta` | `TMeta` | `{}` | Metadata attached to the App context |
| `children` | `ReactNode` | - | Child React components |

## With Metadata

```tsx [with-meta.tsx]
import { App } from '@kubb/react-fabric'

type AppMeta = {
  version: string
  author: string
}

export function Generator() {
  return (
    <App<AppMeta> meta={{ version: '1.0.0', author: 'Code Generator' }}>
      {/* Your components */}
    </App>
  )
}
```

## Differences from Fabric Core

| Feature | Fabric Core | React Fabric |
|---------|-------------|--------------|
| Type system | `FabricNode` | `ReactNode` |
| Implementation | `createComponent` | React component |
| Runtime | FSX | React |
| Hooks | Fabric composables | Can use React hooks |

## See Also

- [App (Fabric Core)](/api/fabric-core/components/app) - FSX version
- [File](/api/react-fabric/components/file) - File generation component
- [Overview](/api/overview) - fabric-core vs react-fabric
