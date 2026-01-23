---
layout: doc
title: Root (Fabric Core)
outline: deep
---

# Root <Badge type="info" text="fabric-core" />

Root component providing core Fabric runtime context.

> [!NOTE]
> This is the **fabric-core** version using FSX and `createComponent`.
> For the React version, see [Root (React Fabric)](/api/react-fabric/components/root).

## Package

```bash
@kubb/fabric-core
```

## Usage

This component is typically used internally by the Fabric renderer.

```tsx [root.tsx]
import { Root } from '@kubb/fabric-core'

<Root
  onExit={(error) => process.exit(error ? 1 : 0)}
  onError={(error) => console.error(error)}
  treeNode={treeNode}
  fileManager={fileManager}
>
  <App>
    Your components here
  </App>
</Root>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onExit` | `(error?: Error) => void` | Callback to exit the application |
| `onError` | `(error: Error) => void` | Error handler for runtime exceptions |
| `treeNode` | `TreeNode<ComponentNode>` | Tree structure for component hierarchy |
| `fileManager` | `FileManager` | FileManager instance |
| `children` | `FabricNode` | Child components |

## See Also

- [Root (React Fabric)](/api/react-fabric/components/root) - React version
- [App](/api/fabric-core/components/app) - App container component
