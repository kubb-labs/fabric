---
layout: doc
title: Root (Fabric Core)
outline: deep
---

# Root <Badge type="info" text="fabric-core" />

Root component providing core Fabric runtime context.

> [!NOTE]
> This is the **fabric-core** version using FSX and `createComponent`.
> For the React version, see [Root (React Fabric)](/react/components/root).

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

Child components.

|           |             |
|----------:|:------------|
|     Type: | `FabricNode` |
| Required: | `false`     |

## See Also

- [Root (React Fabric)](/react/components/root) - React version
- [App](/core/components/app) - App container component
