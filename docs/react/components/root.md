---
layout: doc
title: Root (React Fabric)
outline: deep
---

# Root <Badge type="tip" text="react-fabric" />

React component providing core Fabric runtime context.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Root (Fabric Core)](/core/components/root).

## Usage

This component is typically used internally by the Fabric renderer.

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Root, App, TreeNode } from '@kubb/react-fabric'
import type { ComponentNode } from '@kubb/react-fabric/types'

const fabric = createReactFabric()
const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })

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
:::

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
|     Type: | `KubbNode` |
| Required: | `false`    |

## See Also

- [Root (Fabric Core)](/core/components/root) - FSX version
- [App](/react/components/app) - App container component
- [createReactFabric](/react/createReactFabric) - React Fabric factory
