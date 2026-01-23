---
layout: doc
title: Root (React Fabric)
outline: deep
---

# Root <Badge type="tip" text="react-fabric" />

React component providing core Fabric runtime context.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Root (Fabric Core)](/api/fabric-core/components/root).

## Package

```bash
@kubb/react-fabric
```

## Usage

This component is typically used internally by the Fabric renderer.

```tsx [root.tsx]
import { Root } from '@kubb/react-fabric'

export function Generator() {
  return (
    <Root
      onExit={(error) => process.exit(error ? 1 : 0)}
      onError={(error) => console.error(error)}
      treeNode={treeNode}
      fileManager={fileManager}
    >
      <App>
        {/* Your components */}
      </App>
    </Root>
  )
}
```

## Props

### onExit

Callback to exit the application.

|           |                           |
|----------:|:--------------------------|
|     Type: | `(error?: Error) => void` |
| Required: | `true`                    |

### onError

Error handler for runtime exceptions.

|           |                      |
|----------:|:---------------------|
|     Type: | `(error: Error) => void` |
| Required: | `true`               |

### treeNode

Tree structure for component hierarchy.

|           |                               |
|----------:|:------------------------------|
|     Type: | `TreeNode<ComponentNode>`     |
| Required: | `true`                        |

### fileManager

FileManager instance.

|           |               |
|----------:|:--------------|
|     Type: | `FileManager` |
| Required: | `true`        |

### children

Child React components.

|           |            |
|----------:|:-----------|
|     Type: | `ReactNode` |
| Required: | `false`    |

## See Also

- [Root (Fabric Core)](/api/fabric-core/components/root) - FSX version
- [App](/api/react-fabric/components/app) - App container component
