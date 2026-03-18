---
layout: doc
title: Root Component React - Fabric Runtime Context Provider
description: Root React component provides Fabric runtime context. Internal component for React-based code generators.
outline: deep
---

# Root <Badge type="tip" text="react-fabric" />

Internal React component providing core Fabric runtime context. This component is typically used by the Fabric runtime and doesn't need to be used directly in most code generators.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [Root (Fabric Core)](/core/components/root).

> [!WARNING]
> The Root component is typically used internally by the Fabric runtime.
> You don't need to use it directly in most cases.


## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, Root, Fabric, TreeNode, FileManager } from '@kubb/react-fabric'
import type { ComponentNode } from '@kubb/react-fabric/types'

const fabric = createReactFabric()
const treeNode = new TreeNode<ComponentNode>({ type: 'Root', props: {} })
const fileManager = new FileManager()

export function Generator() {
  return (
    <Root
      onExit={(error?: Error) => process.exit(error ? 1 : 0)}
      onError={(error: Error) => console.error(error)}
      treeNode={treeNode}
      fileManager={fileManager}
    >
      <Fabric>
        {/* Your components */}
      </Fabric>
    </Root>
  )
}
```
:::

## What is the Root Component?

The `Root` component establishes the core runtime context for React Fabric. It manages the component tree, file system operations, error handling, and lifecycle events. Most developers won't use this directly - it's automatically configured by `createReactFabric()`.

## Why Root Exists

- **Runtime context** - Provides essential services to child components
- **Error boundaries** - Centralized error handling for generators
- **File management** - Coordinates file operations across components
- **Tree structure** - Maintains component hierarchy for rendering

## When to Use Root Directly

Only use `Root` directly if you're building custom Fabric runtimes or need low-level control over the rendering pipeline. For standard code generation, use `createReactFabric()` instead.

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

## FAQ

### Do I need to use Root in my generators?

No. The `createReactFabric()` function automatically creates and configures `Root` for you. You only need direct access for advanced customization.

### How does Root differ from Fabric?

`Root` is the runtime context provider (internal infrastructure). `Fabric` is the entry point for your generator components (your code). Always wrap your components in `App`, not `Root`.

### Can I have multiple Root components?

No. Each Fabric instance has one `Root` component that manages the entire component tree and file system.

## Related Components

- [Root (Fabric Core)](/core/components/root) - FSX version for non-React workflows
- [Fabric Component](/react/components/fabric) - Application container for generators
- [createReactFabric()](/react/createReactFabric) - React Fabric factory function

## Next Steps

- [Learn React Fabric basics](/react) - Understand the React runtime
- [createReactFabric API](/react/createReactFabric) - See how Root is configured automatically
